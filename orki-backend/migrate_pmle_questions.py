"""
migrate_pmle_questions.py — PmLE dataset replacement migration.

PHASE 1 — DELETE:
  Removes every Firestore document in the ``questions`` collection where
  ``exam_type == "PmLE"``.  No other exam types (LEPT, CSE, CLE…) are touched.

PHASE 2 — IMPORT:
  Reads all JSON files under  datasets/PmLE/Exams/,  validates each question,
  then writes them to Firestore (collection ``questions``, document ID = source_id).

Usage (from the orki-backend directory, with venv active)::

    # Full migration (delete old → import new)
    python migrate_pmle_questions.py

    # Dry run — no Firestore writes
    python migrate_pmle_questions.py --dry-run

    # Validate JSON files only — no Firestore access at all
    python migrate_pmle_questions.py --validate-only

    # Skip the delete phase (import only)
    python migrate_pmle_questions.py --import-only

    # Skip the import phase (delete only)
    python migrate_pmle_questions.py --delete-only
"""
from __future__ import annotations

import argparse
import json
import logging
import os
import re
import sys
import time
from pathlib import Path
from typing import Any

# ── Bootstrap Django so firebase_admin can read settings.py ──────────────────
_BACKEND_DIR = Path(__file__).resolve().parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django  # noqa: E402
django.setup()

from services.firebase.firestore import get_firestore_client  # noqa: E402

# ── Logging ───────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)-8s %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("pmle_migration")

# ── Constants ─────────────────────────────────────────────────────────────────

EXAM_TYPE = "PmLE"
QUESTIONS_COLLECTION = "questions"
DATASETS_DIR = _BACKEND_DIR / "datasets" / "PmLE" / "Exams"
FIRESTORE_BATCH_SIZE = 50    # Keep batches small to stay within quota limits
FIRESTORE_PAGE_SIZE   = 50    # Documents fetched per query page
BATCH_SLEEP_SECONDS   = 2.0   # Pause between consecutive batch commits
QUOTA_BACKOFF_BASE    = 10    # Seconds for first retry after quota error (doubles each retry)
QUOTA_MAX_RETRIES     = 6     # 10 + 20 + 40 + 80 + 160 + 320 s = ~10 min max wait
VALID_DIFFICULTIES = {"Easy", "Medium", "Hard"}
VALID_ANSWERS = {"A", "B", "C", "D"}

# Subject name → 3-letter abbreviation used to build compound Firestore IDs.
# Format: RPM-{ABBREV}-{zero-padded-number}  e.g. RPM-ABN-001
SUBJECT_ABBREVIATIONS: dict[str, str] = {
    "Abnormal Psychology":          "ABN",
    "Biological Psychology":        "BIO",
    "Cognitive Psychology":         "COG",
    "Developmental Psychology":     "DEV",
    "Field Methods in Psychology":  "FMP",
    "Psychology of Learning":       "POL",
    "Theories of Personalities":    "TOP",
}


def _build_firestore_id(raw_id: str, subject: str) -> str:
    """
    Convert a bare JSON question ID (e.g. 'RPM-001') into a compound
    Firestore document ID (e.g. 'RPM-ABN-001') that is unique across subjects.

    Falls back to ``{subject_abbrev}-{raw_id}`` if the ID doesn't match the
    expected ``RPM-NNN`` pattern.
    """
    abbrev = SUBJECT_ABBREVIATIONS.get(subject, "UNK")
    # Match trailing digits:  "RPM-001" → "001",  "RPM-042" → "042"
    m = re.search(r'(\d+)$', raw_id)
    if m:
        return f"RPM-{abbrev}-{m.group(1).zfill(3)}"
    # Fallback for unexpected ID formats
    return f"RPM-{abbrev}-{raw_id}"


# ── Quota-safe retry helper ───────────────────────────────────────────────────

def _run_with_backoff(fn, label: str = "operation"):
    """
    Execute *fn* (a zero-argument callable) and retry on Firestore
    RESOURCE_EXHAUSTED (quota-exceeded) errors with exponential backoff.

    Raises the underlying exception after QUOTA_MAX_RETRIES attempts.
    """
    from google.api_core.exceptions import ResourceExhausted  # noqa: PLC0415

    for attempt in range(QUOTA_MAX_RETRIES):
        try:
            return fn()
        except ResourceExhausted:
            if attempt == QUOTA_MAX_RETRIES - 1:
                raise
            wait = QUOTA_BACKOFF_BASE * (2 ** attempt)
            logger.warning(
                "Quota exceeded on %s — waiting %ds before retry %d/%d…",
                label, wait, attempt + 1, QUOTA_MAX_RETRIES,
            )
            time.sleep(wait)


# ══════════════════════════════════════════════════════════════════════════════
# PHASE 1 — DELETE
# ══════════════════════════════════════════════════════════════════════════════

def delete_pmle_questions(db, dry_run: bool) -> int:
    """
    Delete all Firestore documents in ``questions`` where exam_type == 'PmLE'.

    Uses paginated queries + batched deletes so it handles any collection size.
    Returns the total number of documents deleted (or that *would be* deleted).
    """
    logger.info("=" * 60)
    logger.info("PHASE 1 — Deleting existing PmLE questions from Firestore")
    logger.info("=" * 60)

    collection_ref = db.collection(QUESTIONS_COLLECTION)
    query = collection_ref.where("exam_type", "==", EXAM_TYPE)

    total_deleted = 0

    while True:
        docs = _run_with_backoff(
            lambda: list(query.limit(FIRESTORE_PAGE_SIZE).stream()),
            label="delete-query",
        )
        if not docs:
            break

        batch = db.batch()
        for doc in docs:
            logger.info("  Deleting: %s", doc.id)
            if not dry_run:
                batch.delete(doc.reference)
            total_deleted += 1

        if not dry_run:
            _run_with_backoff(batch.commit, label="delete-batch-commit")
            logger.debug("  → Committed delete batch of %d; sleeping %ss…",
                         len(docs), BATCH_SLEEP_SECONDS)
            time.sleep(BATCH_SLEEP_SECONDS)

    if dry_run:
        logger.info("[DRY RUN] Would delete %d PmLE question(s).", total_deleted)
    else:
        logger.info("Deleted %d PmLE question(s).", total_deleted)

    return total_deleted


# ══════════════════════════════════════════════════════════════════════════════
# PHASE 2 — IMPORT
# ══════════════════════════════════════════════════════════════════════════════

def _discover_json_files() -> list[Path]:
    """Return all *.json files under DATASETS_DIR, sorted alphabetically."""
    if not DATASETS_DIR.exists():
        logger.error("Datasets directory not found: %s", DATASETS_DIR)
        return []
    files = sorted(DATASETS_DIR.rglob("*.json"))
    logger.debug("Discovered %d JSON file(s) in %s", len(files), DATASETS_DIR)
    return files


def _validate_question(q: Any, source_file: str, seen_ids: set[str]) -> tuple[list[str], list[str]]:
    """
    Validate a single question dict.

    Returns (errors, warnings) — both are lists of human-readable strings.
    An *error* means the question will be skipped; a *warning* is logged but
    the question is still imported.
    """
    errors: list[str] = []
    warnings: list[str] = []

    if not isinstance(q, dict):
        errors.append("Question is not a JSON object")
        return errors, warnings

    q_id = str(q.get("id") or q.get("question_id") or "").strip()
    label = q_id or "<unknown>"

    # ── Required: id ─────────────────────────────────────────────────────────
    if not q_id:
        errors.append(f"[{label}] Missing required field 'id'")
        return errors, warnings   # Can't continue without an ID

    if q_id in seen_ids:
        errors.append(f"[{q_id}] Duplicate question ID within file")
    seen_ids.add(q_id)

    # ── Required: question text ───────────────────────────────────────────────
    question_text = (q.get("question") or q.get("question_text") or "").strip()
    if not question_text:
        errors.append(f"[{q_id}] Missing required field 'question'")

    # ── Required: choices ────────────────────────────────────────────────────
    choices = q.get("choices")
    if not isinstance(choices, dict) or not choices.get("A") or not choices.get("B"):
        errors.append(f"[{q_id}] 'choices' must contain at least 'A' and 'B'")

    # ── Required: correct_answer ─────────────────────────────────────────────
    correct = str(q.get("correct_answer") or "").strip().upper()
    if correct not in VALID_ANSWERS:
        errors.append(
            f"[{q_id}] 'correct_answer' must be one of {sorted(VALID_ANSWERS)}, got '{correct}'"
        )

    # ── Optional but validated: difficulty ───────────────────────────────────
    difficulty = (q.get("difficulty") or "").strip()
    if difficulty and difficulty not in VALID_DIFFICULTIES:
        warnings.append(
            f"[{q_id}] 'difficulty' '{difficulty}' not in {sorted(VALID_DIFFICULTIES)} — defaulting to 'Medium'"
        )

    # ── Optional: explanation ─────────────────────────────────────────────────
    if not q.get("explanation"):
        warnings.append(f"[{q_id}] Missing 'explanation' field")

    return errors, warnings


def _normalise_question(q: dict, exam_type: str, subject: str, source_file: Path) -> dict:
    """
    Build a Firestore-ready document from a raw question dict.

    Preserves all required fields and applies safe defaults for optional ones.
    """
    raw_id = str(q.get("id") or q.get("question_id")).strip()
    doc_id = _build_firestore_id(raw_id, subject)   # e.g. RPM-ABN-001
    choices = q.get("choices", {})
    difficulty = (q.get("difficulty") or "Medium").strip()
    if difficulty not in VALID_DIFFICULTIES:
        difficulty = "Medium"

    return {
        # Internal routing key used as the Firestore document ID
        "_firestore_doc_id": doc_id,
        # Partition / routing
        "exam_type": exam_type,
        "subject": subject,
        "topic": (q.get("topic") or "").strip(),
        # Question content
        "question": (q.get("question") or q.get("question_text") or "").strip(),
        "choices": {k: v for k, v in choices.items() if v},
        "correct_answer": str(q.get("correct_answer") or "").upper().strip(),
        "explanation": (q.get("explanation") or "").strip(),
        "difficulty": difficulty,
        "tags": q.get("tags") or [],
        # Provenance — source_id now stores the compound ID to match Firestore convention
        "source_id": doc_id,
        "source_file": source_file.name,
    }


def _load_and_validate_file(path: Path) -> tuple[list[dict], int, int]:
    """
    Load a single JSON file, validate every question, and return
    ``(normalised_questions, error_count, warning_count)``.
    """
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except (json.JSONDecodeError, OSError) as exc:
        logger.error("  ✗ Failed to read %s: %s", path.name, exc)
        return [], 1, 0

    # Support both wrapped {"questions": [...]} and bare [...] schemas
    if isinstance(data, dict):
        exam_type = (data.get("exam_type") or EXAM_TYPE).strip()
        subject = (data.get("subject") or "").strip()
        raw_questions = data.get("questions", [])
    elif isinstance(data, list):
        exam_type = EXAM_TYPE
        subject = path.stem  # fall back to filename
        raw_questions = data
    else:
        logger.error("  ✗ Unexpected top-level structure in %s", path.name)
        return [], 1, 0

    if not subject:
        subject = path.stem  # last resort

    total_errors = 0
    total_warnings = 0
    normalised: list[dict] = []
    seen_ids: set[str] = set()

    for q in raw_questions:
        errors, warnings = _validate_question(q, path.name, seen_ids)

        for w in warnings:
            logger.warning("    WARN  %s %s", path.name, w)
            total_warnings += 1

        if errors:
            for e in errors:
                logger.error("    ERROR %s %s", path.name, e)
                total_errors += 1
            continue  # skip invalid questions

        normalised.append(_normalise_question(q, exam_type, subject, path))

    return normalised, total_errors, total_warnings


def _write_batch(db, questions: list[dict], dry_run: bool) -> int:
    """
    Write questions to Firestore in batches of FIRESTORE_BATCH_SIZE.

    Uses the compound ``_firestore_doc_id`` (e.g. RPM-ABN-001) as the
    Firestore document ID, then strips the internal key before writing.
    Returns the number of documents written (or that would be written).
    """
    from firebase_admin import firestore as fs  # noqa: PLC0415

    written = 0

    if dry_run:
        for q in questions:
            logger.info("  [DRY RUN] Importing: %s", q["_firestore_doc_id"])
            written += 1
        return written

    batch = db.batch()
    batch_count = 0

    for q in questions:
        doc_id = q["_firestore_doc_id"]
        doc_ref = db.collection(QUESTIONS_COLLECTION).document(doc_id)
        # Strip the internal routing key — it must not be stored in Firestore
        payload = {k: v for k, v in q.items() if k != "_firestore_doc_id"}
        payload["created_at"] = fs.SERVER_TIMESTAMP
        batch.set(doc_ref, payload)
        batch_count += 1
        written += 1
        logger.info("  Importing: %s", doc_id)

        if batch_count >= FIRESTORE_BATCH_SIZE:
            _run_with_backoff(batch.commit, label="import-batch-commit")
            logger.debug("  → Committed import batch of %d; sleeping %ss…",
                         batch_count, BATCH_SLEEP_SECONDS)
            time.sleep(BATCH_SLEEP_SECONDS)
            batch = db.batch()
            batch_count = 0

    if batch_count > 0:
        _run_with_backoff(batch.commit, label="import-final-batch-commit")
        logger.debug("  → Committed final import batch of %d", batch_count)
        time.sleep(BATCH_SLEEP_SECONDS)

    return written


def import_pmle_questions(db, dry_run: bool, validate_only: bool) -> tuple[int, int, int]:
    """
    Validate and import all PmLE JSON files from DATASETS_DIR.

    Returns (questions_imported, total_errors, total_warnings).
    """
    logger.info("=" * 60)
    logger.info("PHASE 2 — Importing new PmLE questions")
    logger.info("  Source: %s", DATASETS_DIR)
    logger.info("=" * 60)

    json_files = _discover_json_files()
    if not json_files:
        logger.error("No JSON files found in %s", DATASETS_DIR)
        return 0, 1, 0

    logger.info("Found %d JSON file(s):", len(json_files))
    for f in json_files:
        logger.info("  - %s", f.name)

    # ── Validation pass ───────────────────────────────────────────────────────
    logger.info("")
    logger.info("Validating datasets…")

    all_questions: list[dict] = []
    total_errors = 0
    total_warnings = 0

    for path in json_files:
        questions, errors, warnings = _load_and_validate_file(path)
        total_errors += errors
        total_warnings += warnings

        status = "✗" if errors else ("⚠" if warnings else "✓")
        logger.info(
            "  %s %-45s — %d question(s) valid, %d error(s), %d warning(s)",
            status, path.name, len(questions), errors, warnings,
        )
        all_questions.extend(questions)

    logger.info("")
    logger.info(
        "Validation complete — %d question(s) valid | %d error(s) | %d warning(s)",
        len(all_questions), total_errors, total_warnings,
    )

    if validate_only:
        return 0, total_errors, total_warnings

    if total_errors > 0:
        logger.error(
            "Aborting import: %d validation error(s) found. "
            "Fix the data or review the errors above.",
            total_errors,
        )
        return 0, total_errors, total_warnings

    if not all_questions:
        logger.error("No valid questions to import.")
        return 0, 1, total_warnings

    # ── Import pass ───────────────────────────────────────────────────────────
    logger.info("")
    logger.info("Writing %d question(s) to Firestore collection '%s'…",
                len(all_questions), QUESTIONS_COLLECTION)

    imported = _write_batch(db, all_questions, dry_run)
    return imported, total_errors, total_warnings


# ══════════════════════════════════════════════════════════════════════════════
# POST-MIGRATION VERIFICATION
# ══════════════════════════════════════════════════════════════════════════════

def verify_migration(db) -> bool:
    """
    Spot-check the Firestore collection after import.

    Returns True if all checks pass.
    """
    logger.info("=" * 60)
    logger.info("POST-MIGRATION VERIFICATION")
    logger.info("=" * 60)

    ok = True
    query = db.collection(QUESTIONS_COLLECTION).where("exam_type", "==", EXAM_TYPE)

    # Count total PmLE documents
    docs = list(query.stream())
    logger.info("  Total PmLE questions in Firestore: %d", len(docs))
    if not docs:
        logger.error("  ✗ No PmLE questions found — import may have failed!")
        ok = False

    # Check subject distribution
    subjects: dict[str, int] = {}
    for doc in docs:
        data = doc.to_dict()
        subj = data.get("subject", "unknown")
        subjects[subj] = subjects.get(subj, 0) + 1

    logger.info("  Subject breakdown:")
    for subj, count in sorted(subjects.items()):
        logger.info("    %-45s — %d question(s)", subj, count)

    # Verify no non-PmLE documents were affected
    non_pmle_sample = (
        db.collection(QUESTIONS_COLLECTION)
        .where("exam_type", "!=", EXAM_TYPE)
        .limit(1)
        .stream()
    )
    non_pmle_count = sum(1 for _ in non_pmle_sample)
    if non_pmle_count > 0:
        logger.info("  ✓ Non-PmLE questions are still present (not deleted).")
    else:
        logger.warning("  ⚠ Could not confirm presence of non-PmLE questions.")

    # Sample a random document to verify required fields
    if docs:
        sample = docs[0].to_dict()
        required_fields = {
            "exam_type", "subject", "topic", "question", "choices",
            "correct_answer", "explanation", "difficulty", "tags",
            "source_id", "source_file",
        }
        missing = required_fields - set(sample.keys())
        if missing:
            logger.error("  ✗ Sample document missing fields: %s", missing)
            ok = False
        else:
            logger.info("  ✓ Sample document has all required fields.")

    if ok:
        logger.info("  ✓ All verification checks passed.")
    else:
        logger.error("  ✗ Some verification checks FAILED — review logs above.")

    return ok


# ══════════════════════════════════════════════════════════════════════════════
# ENTRY POINT
# ══════════════════════════════════════════════════════════════════════════════

def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        description="PmLE dataset replacement migration — delete old, import new.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python migrate_pmle_questions.py                # full migration
  python migrate_pmle_questions.py --dry-run      # simulate, no Firestore writes
  python migrate_pmle_questions.py --validate-only# validate JSON, no Firestore access
  python migrate_pmle_questions.py --delete-only  # only delete existing PmLE docs
  python migrate_pmle_questions.py --import-only  # skip delete, only import
""",
    )
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="Simulate all operations without writing to or deleting from Firestore.",
    )
    p.add_argument(
        "--validate-only",
        action="store_true",
        help="Validate JSON files only. No Firestore connection required.",
    )
    p.add_argument(
        "--delete-only",
        action="store_true",
        help="Delete existing PmLE Firestore documents and exit (no import).",
    )
    p.add_argument(
        "--import-only",
        action="store_true",
        help="Import new questions without deleting existing PmLE documents first.",
    )
    p.add_argument(
        "--skip-verify",
        action="store_true",
        help="Skip the post-migration Firestore verification step.",
    )
    p.add_argument(
        "--log-level",
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        help="Logging verbosity (default: INFO)",
    )
    return p


def main() -> int:
    args = _build_parser().parse_args()

    # Re-configure log level from CLI arg
    logging.getLogger().setLevel(getattr(logging, args.log_level))

    logger.info("╔══════════════════════════════════════════════════════════╗")
    logger.info("║         Orki PmLE Dataset Replacement Migration          ║")
    logger.info("╚══════════════════════════════════════════════════════════╝")
    logger.info("  Exam type : %s", EXAM_TYPE)
    logger.info("  Source    : %s", DATASETS_DIR)
    logger.info("  Dry run   : %s", args.dry_run)
    logger.info("  Mode      : %s", (
        "validate-only" if args.validate_only else
        "delete-only"   if args.delete_only   else
        "import-only"   if args.import_only   else
        "full migration"
    ))
    logger.info("")

    # --validate-only: no Firestore needed
    if args.validate_only:
        _, errors, warnings = import_pmle_questions(db=None, dry_run=True, validate_only=True)
        logger.info("")
        logger.info("Validation result — errors: %d | warnings: %d", errors, warnings)
        return 0 if errors == 0 else 1

    # All other modes need Firestore
    try:
        db = get_firestore_client()
    except Exception as exc:
        logger.error("Failed to connect to Firestore: %s", exc)
        logger.error(
            "Ensure FIREBASE_CREDENTIALS_PATH and FIREBASE_PROJECT_ID are set in your .env "
            "and the service account JSON exists."
        )
        return 1

    deleted = 0
    imported = 0
    errors = 0

    # ── Delete phase ──────────────────────────────────────────────────────────
    if not args.import_only:
        deleted = delete_pmle_questions(db, dry_run=args.dry_run)
        logger.info("")

    if args.delete_only:
        logger.info("Delete-only mode — skipping import.")
        logger.info("")
        logger.info("─" * 60)
        logger.info("Deleted %d old PmLE question(s).", deleted)
        return 0

    # ── Import phase ──────────────────────────────────────────────────────────
    imported, errors, warnings = import_pmle_questions(
        db=db,
        dry_run=args.dry_run,
        validate_only=False,
    )
    logger.info("")

    # ── Summary ───────────────────────────────────────────────────────────────
    logger.info("─" * 60)
    if args.dry_run:
        logger.info("[DRY RUN] Would delete %d old PmLE questions.", deleted)
        logger.info("[DRY RUN] Would import %d new PmLE questions.", imported)
    else:
        logger.info("Deleted  %d old PmLE questions.", deleted)
        logger.info("Imported %d new PmLE questions successfully.", imported)
    logger.info("─" * 60)

    # ── Post-migration verification ───────────────────────────────────────────
    if not args.dry_run and not args.skip_verify and imported > 0:
        logger.info("")
        passed = verify_migration(db)
        if not passed:
            return 1

    if errors > 0:
        logger.error("Migration completed with %d validation error(s).", errors)
        return 1

    logger.info("")
    logger.info("✓ PmLE migration complete.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
