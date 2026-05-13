"""
import_to_firestore.py — JSON dataset → Firebase Firestore importer.

Scans all dataset JSON files under ``datasets/``, validates them,
normalises the data, and uploads questions (and related metadata) into
Firestore using the following collection architecture:

    exam_types/{code}               — e.g. LEPT, CSE, PmLE, CLE
    subjects/{exam_type}_{slug}     — one doc per exam_type+subject pair
    questions/{source_id}           — one doc per question (idempotent)

Running the importer multiple times is safe — existing Firestore
documents are overwritten (merge=False) so stale data is replaced with
the current JSON version.

Usage (run from project root with venv active)::

    python -m services.datasets.import_to_firestore
    python -m services.datasets.import_to_firestore --exam-type LEPT
    python -m services.datasets.import_to_firestore --exam-type CSE --subject verbal-ability
    python -m services.datasets.import_to_firestore --dry-run
    python -m services.datasets.import_to_firestore --validate-only
"""
from __future__ import annotations

import argparse
import json
import logging
import os
import sys
from pathlib import Path
from typing import Any

# ── Bootstrap Django settings so firebase_admin can read settings.py ──────────
_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django  # noqa: E402
django.setup()

from services.firebase.firestore import get_firestore_client  # noqa: E402
from services.datasets.validators import validate_file  # noqa: E402

logger = logging.getLogger(__name__)

# ─── Dataset Root ─────────────────────────────────────────────────────────────

DATASETS_ROOT = _BACKEND_DIR / "datasets"

# ─── Exam-type folder → canonical code ────────────────────────────────────────

FOLDER_TO_EXAM_TYPE: dict[str, str] = {
    "lept": "LEPT",
    "cse": "CSE",
    "pmle": "PmLE",
    "cle": "CLE",
}

EXAM_TYPE_NAMES: dict[str, str] = {
    "LEPT": "Licensure Examination for Professional Teachers",
    "CSE": "Civil Service Examination",
    "PmLE": "Psychometricians Licensure Examination",
    "CLE": "Criminologist Licensure Examination",
}

# ─── Helpers ──────────────────────────────────────────────────────────────────

def _folder_slug_to_subject(slug: str) -> str:
    """Convert a hyphenated folder name to a human-readable subject name."""
    return slug.replace("-", " ").title()


def _discover_files(
    exam_type_filter: str | None = None,
    subject_filter: str | None = None,
) -> list[tuple[Path, str, str]]:
    """
    Walk ``datasets/`` and return ``(path, exam_type, subject)`` tuples.

    Both filters are case-insensitive partial matches.
    """
    results: list[tuple[Path, str, str]] = []

    for exam_folder in sorted(DATASETS_ROOT.iterdir()):
        if not exam_folder.is_dir():
            continue

        exam_type = FOLDER_TO_EXAM_TYPE.get(exam_folder.name.lower())
        if exam_type is None:
            logger.debug("Skipping unrecognised exam folder: %s", exam_folder.name)
            continue

        if exam_type_filter and exam_type.lower() != exam_type_filter.lower():
            continue

        for json_file in sorted(exam_folder.rglob("*.json")):
            # Derive subject from the immediate parent folder of the JSON file
            # (works for nested structures like lept/GenEd/english.json)
            subject_slug = json_file.parent.name
            subject = _folder_slug_to_subject(subject_slug)

            # For LEPT, trust the wrapped exam_type/subject fields instead
            # (resolved later during normalisation)

            if subject_filter and subject_filter.lower() not in subject.lower() and subject_filter.lower() not in subject_slug.lower():
                continue

            results.append((json_file, exam_type, subject))

    return results


def _normalise_questions(
    data: Any,
    exam_type: str,
    subject: str,
    source_file: Path,
) -> list[dict]:
    """
    Extract and normalise questions from either schema variant:

    - Wrapped:  ``{"exam_type": ..., "subject": ..., "questions": [...]}``
    - Bare list: ``[{...}, ...]``

    Returns a list of normalised question dicts ready for Firestore.
    """
    if isinstance(data, dict):
        # Prefer metadata embedded in the JSON over the folder-inferred values
        exam_type = data.get("exam_type") or exam_type
        subject = data.get("subject") or subject
        raw_questions = data.get("questions", [])
    elif isinstance(data, list):
        raw_questions = data
    else:
        logger.warning("Unexpected data structure in %s — skipping", source_file)
        return []

    normalised: list[dict] = []
    for q in raw_questions:
        if not isinstance(q, dict):
            continue

        q_id = q.get("id") or q.get("question_id")
        if not q_id:
            logger.warning("Question without 'id' in %s — skipping", source_file)
            continue

        choices = q.get("choices", {})
        correct = (q.get("correct_answer") or "").upper()

        doc = {
            # Partition / routing metadata
            "exam_type": exam_type,
            "subject": subject,
            "topic": q.get("topic") or "",
            # Content
            "question": q.get("question") or q.get("question_text") or "",
            "choices": {k: v for k, v in choices.items() if v},
            "correct_answer": correct,
            "explanation": q.get("explanation") or "",
            "difficulty": q.get("difficulty") or "Medium",
            "tags": q.get("tags") or [],
            # Provenance
            "source_id": str(q_id),
            "source_file": source_file.name,
        }
        normalised.append(doc)

    return normalised


# ─── Firestore write helpers ──────────────────────────────────────────────────

def _ensure_exam_type(db, exam_type: str, dry_run: bool) -> None:
    """Upsert an exam_types document."""
    payload = {
        "code": exam_type,
        "name": EXAM_TYPE_NAMES.get(exam_type, exam_type),
    }
    if not dry_run:
        db.collection("exam_types").document(exam_type).set(payload)
    logger.debug("[DRY RUN] " if dry_run else "" + "exam_types/%s → %s", exam_type, payload)


def _ensure_subject(db, exam_type: str, subject: str, dry_run: bool) -> None:
    """Upsert a subjects document."""
    slug = subject.lower().replace(" ", "-")
    doc_id = f"{exam_type}_{slug}"
    payload = {
        "exam_type": exam_type,
        "name": subject,
        "slug": slug,
    }
    if not dry_run:
        db.collection("subjects").document(doc_id).set(payload)
    logger.debug("[DRY RUN] " if dry_run else "" + "subjects/%s → %s", doc_id, payload)


def _write_questions_batch(
    db,
    questions: list[dict],
    dry_run: bool,
) -> tuple[int, int]:
    """
    Write questions to Firestore in batches of 500.

    Returns (written, skipped) counts.
    """
    from firebase_admin import firestore as fs  # noqa: PLC0415

    BATCH_SIZE = 499  # Firestore limit is 500 ops per commit
    written = 0

    if dry_run:
        for q in questions:
            logger.debug("[DRY RUN] Would write questions/%s", q["source_id"])
            written += 1
        return written, 0

    batch = db.batch()
    batch_count = 0

    for q in questions:
        doc_ref = db.collection("questions").document(q["source_id"])
        batch.set(doc_ref, {**q, "created_at": fs.SERVER_TIMESTAMP})
        batch_count += 1
        written += 1

        if batch_count >= BATCH_SIZE:
            batch.commit()
            batch = db.batch()
            batch_count = 0

    if batch_count > 0:
        batch.commit()

    return written, 0


# ─── Main import orchestrator ─────────────────────────────────────────────────

def run_import(
    exam_type_filter: str | None = None,
    subject_filter: str | None = None,
    dry_run: bool = False,
    validate_only: bool = False,
) -> dict:
    """
    Discover, validate, and import all matching dataset files.

    Returns a summary dict with keys: files, questions_written, errors, warnings.
    """
    summary: dict[str, int] = {
        "files_processed": 0,
        "files_skipped": 0,
        "questions_written": 0,
        "validation_errors": 0,
        "validation_warnings": 0,
    }

    files = _discover_files(exam_type_filter, subject_filter)
    if not files:
        logger.warning("No dataset files found matching the given filters.")
        return summary

    # ── Validation pass ───────────────────────────────────────────────────────
    logger.info("Validating %d dataset file(s)…", len(files))
    all_valid = True
    for path, exam_type, subject in files:
        result = validate_file(path, exam_type, subject)
        summary["validation_errors"] += len(result.errors)
        summary["validation_warnings"] += len(result.warnings)
        if not result.is_valid:
            all_valid = False
            logger.error("%s", result)
        elif result.warnings:
            logger.warning("%s", result)
        else:
            logger.info("  ✓ %s — OK", path.name)

    if validate_only:
        logger.info("Validation complete. Errors: %d  Warnings: %d",
                    summary["validation_errors"], summary["validation_warnings"])
        return summary

    if not all_valid:
        logger.error("Aborting import due to validation errors. Fix them or use --validate-only to inspect.")
        return summary

    # ── Import pass ───────────────────────────────────────────────────────────
    db = None if dry_run else get_firestore_client()

    seen_exam_types: set[str] = set()
    seen_subjects: set[tuple[str, str]] = set()

    for path, folder_exam_type, folder_subject in files:
        logger.info("Importing: %s", path.relative_to(DATASETS_ROOT))

        try:
            with open(path, encoding="utf-8") as f:
                data = json.load(f)
        except (json.JSONDecodeError, OSError) as exc:
            logger.error("Failed to load %s: %s", path, exc)
            summary["files_skipped"] += 1
            continue

        questions = _normalise_questions(data, folder_exam_type, folder_subject, path)
        if not questions:
            logger.warning("No questions extracted from %s — skipping", path.name)
            summary["files_skipped"] += 1
            continue

        # Resolve actual exam_type and subject from first normalised question
        actual_exam_type = questions[0]["exam_type"]
        actual_subject = questions[0]["subject"]

        # Upsert exam_type + subject documents once per unique combination
        if actual_exam_type not in seen_exam_types:
            _ensure_exam_type(db, actual_exam_type, dry_run)
            seen_exam_types.add(actual_exam_type)

        subject_key = (actual_exam_type, actual_subject)
        if subject_key not in seen_subjects:
            _ensure_subject(db, actual_exam_type, actual_subject, dry_run)
            seen_subjects.add(subject_key)

        written, _ = _write_questions_batch(db, questions, dry_run)
        summary["questions_written"] += written
        summary["files_processed"] += 1
        logger.info("  → %d question(s) written (%s)", written, "DRY RUN" if dry_run else "Firestore")

    logger.info(
        "Import complete — files: %d processed / %d skipped | questions: %d written | "
        "validation: %d errors / %d warnings",
        summary["files_processed"],
        summary["files_skipped"],
        summary["questions_written"],
        summary["validation_errors"],
        summary["validation_warnings"],
    )
    return summary


# ─── CLI entry point ──────────────────────────────────────────────────────────

def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Import Orki examination datasets from JSON into Firebase Firestore.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python -m services.datasets.import_to_firestore
  python -m services.datasets.import_to_firestore --exam-type LEPT
  python -m services.datasets.import_to_firestore --exam-type CSE --subject verbal-ability
  python -m services.datasets.import_to_firestore --dry-run
  python -m services.datasets.import_to_firestore --validate-only
""",
    )
    parser.add_argument(
        "--exam-type",
        metavar="TYPE",
        help="Only import datasets for this exam type (LEPT, CSE, PmLE, CLE)",
    )
    parser.add_argument(
        "--subject",
        metavar="SUBJECT",
        help="Only import datasets matching this subject name or folder slug",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate and log what would be written without touching Firestore",
    )
    parser.add_argument(
        "--validate-only",
        action="store_true",
        help="Run validation only — do not write anything to Firestore",
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        help="Logging verbosity (default: INFO)",
    )
    return parser


if __name__ == "__main__":
    args = _build_parser().parse_args()

    logging.basicConfig(
        level=getattr(logging, args.log_level),
        format="%(levelname)s %(message)s",
    )

    summary = run_import(
        exam_type_filter=args.exam_type,
        subject_filter=args.subject,
        dry_run=args.dry_run,
        validate_only=args.validate_only,
    )

    has_errors = summary["validation_errors"] > 0
    sys.exit(1 if has_errors and not args.dry_run else 0)
