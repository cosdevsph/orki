"""
loader.py — Dataset loader: reads JSON files and populates MockExam + MockExamQuestion.

Maps the Orki dataset schema (datasets/<exam_type>/<subject>.json) to Django models.
Designed to be idempotent — running multiple times will not create duplicates.

Usage (management command):
    python manage.py load_datasets
    python manage.py load_datasets --exam_type LEPT
    python manage.py load_datasets --exam_type CSE --subject verbal
"""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

# Maps dataset exam_type values to MockExam category codes
EXAM_TYPE_CATEGORY_MAP: dict[str, list[str]] = {
    "LEPT": ["LET_GENED", "LET_PROFEDU"],
    "CSE": ["CSE_PROF", "CSE_SUBPROF"],
    "PmLE": ["PMLE_MAIN"],
    "CLE": ["CLE_MAIN"],
}

# Maps subject names to MockExam category (first matching category is used)
SUBJECT_CATEGORY_MAP: dict[str, str] = {
    # LEPT
    "English": "LET_GENED",
    "Filipino": "LET_GENED",
    "Mathematics": "LET_GENED",
    "Science": "LET_GENED",
    "Social Science": "LET_GENED",
    # CSE
    "Verbal Ability": "CSE_PROF",
    "Numerical Ability": "CSE_PROF",
    "Analytical Ability": "CSE_PROF",
    "General Information": "CSE_PROF",
    # PmLE
    "Abnormal Psychology": "PMLE_MAIN",
    "Industrial Psychology": "PMLE_MAIN",
    "Developmental Psychology": "PMLE_MAIN",
    "Psychological Assessment": "PMLE_MAIN",
    # CLE
    "Criminal Law": "CLE_MAIN",
    "Criminology": "CLE_MAIN",
    "Forensic Science": "CLE_MAIN",
    "Law Enforcement": "CLE_MAIN",
}

DATASETS_ROOT = Path(__file__).resolve().parent.parent.parent / "datasets"


def get_dataset_files(exam_type: str | None = None, subject: str | None = None) -> list[Path]:
    """Return all JSON dataset file paths, optionally filtered."""
    if not DATASETS_ROOT.exists():
        logger.error("Datasets directory not found: %s", DATASETS_ROOT)
        return []

    pattern = "**/*.json"
    files = list(DATASETS_ROOT.glob(pattern))

    if exam_type:
        files = [f for f in files if f.parent.name.upper() == exam_type.upper()]
    if subject:
        files = [f for f in files if subject.lower() in f.stem.lower()]

    return sorted(files)


def load_dataset_file(file_path: Path) -> dict[str, Any] | None:
    """Load and validate a single dataset JSON file."""
    try:
        with file_path.open("r", encoding="utf-8") as f:
            data = json.load(f)
    except (json.JSONDecodeError, OSError) as exc:
        logger.error("Failed to load dataset %s: %s", file_path, exc)
        return None

    required_keys = {"exam_type", "subject", "questions"}
    if not required_keys.issubset(data.keys()):
        logger.error("Dataset %s is missing required keys: %s", file_path, required_keys - set(data.keys()))
        return None

    return data


def import_dataset_to_db(
    data: dict[str, Any],
    difficulty_override: str | None = None,
) -> tuple[int, int]:
    """
    Import a dataset dict into MockExam + MockExamQuestion models.

    Returns (created_count, skipped_count) for questions.
    """
    from exams.models import MockExam, MockExamQuestion  # noqa: PLC0415 — avoid circular at module load

    exam_type = data["exam_type"]
    subject = data["subject"]
    questions_data = data.get("questions", [])

    if not questions_data:
        logger.warning("Dataset for %s/%s has no questions.", exam_type, subject)
        return 0, 0

    # Resolve MockExam category
    category = SUBJECT_CATEGORY_MAP.get(subject)
    if not category:
        # Fallback: use first category for exam type
        cats = EXAM_TYPE_CATEGORY_MAP.get(exam_type, [])
        category = cats[0] if cats else "CSE_PROF"
        logger.warning("Subject '%s' not in SUBJECT_CATEGORY_MAP, using '%s'.", subject, category)

    # Ensure MockExam exists for this subject
    mock_exam, created = MockExam.objects.get_or_create(
        title=f"{subject} — {exam_type} Practice",
        category=category,
        defaults={
            "description": f"Curated {subject} practice questions for {exam_type} preparation.",
            "subject": subject,
            "difficulty": difficulty_override or "intermediate",
            "question_count": len(questions_data),
            "duration_minutes": max(30, len(questions_data) * 2),
            "is_active": True,
        },
    )
    if created:
        logger.info("Created MockExam: %s (%s)", mock_exam.title, category)
    else:
        # Update question count if dataset grew
        if mock_exam.question_count != len(questions_data):
            mock_exam.question_count = len(questions_data)
            mock_exam.save(update_fields=["question_count"])

    created_count = 0
    skipped_count = 0

    for order, q in enumerate(questions_data, start=1):
        question_id = q.get("id", "")
        choices = q.get("choices", {})

        # Use question_id as a unique marker stored in the text prefix to detect duplicates
        if MockExamQuestion.objects.filter(
            mock_exam=mock_exam,
            question_text__startswith=f"[{question_id}]",
        ).exists():
            skipped_count += 1
            continue

        difficulty = q.get("difficulty", "Medium").lower()
        # Normalize difficulty to MockExam choices
        if difficulty in ("easy",):
            exam_difficulty = "beginner"
        elif difficulty in ("hard",):
            exam_difficulty = "advanced"
        else:
            exam_difficulty = "intermediate"

        MockExamQuestion.objects.create(
            mock_exam=mock_exam,
            question_text=f"[{question_id}] {q.get('question', '')}",
            question_type="multiple_choice",
            category=q.get("topic", subject),
            option_a=choices.get("A", ""),
            option_b=choices.get("B", ""),
            option_c=choices.get("C", ""),
            option_d=choices.get("D", ""),
            correct_answer=q.get("correct_answer", "A"),
            explanation=q.get("explanation", ""),
            order=order,
        )
        created_count += 1

    logger.info(
        "Dataset %s/%s: %d created, %d skipped.",
        exam_type, subject, created_count, skipped_count,
    )
    return created_count, skipped_count


def load_all_datasets(
    exam_type: str | None = None,
    subject: str | None = None,
) -> dict[str, tuple[int, int]]:
    """
    Load all matching dataset files into the database.

    Returns a dict mapping file paths to (created, skipped) counts.
    """
    files = get_dataset_files(exam_type=exam_type, subject=subject)
    if not files:
        logger.warning("No dataset files found for exam_type=%s subject=%s", exam_type, subject)
        return {}

    results = {}
    for file_path in files:
        data = load_dataset_file(file_path)
        if data is None:
            continue
        counts = import_dataset_to_db(data)
        results[str(file_path)] = counts

    return results


# ─── API-layer helpers (no DB, pure dataset reading) ─────────────────────────


def get_subjects_for_exam_type(exam_type: str) -> list[str]:
    """Return the list of subject names available for the given exam type."""
    files = get_dataset_files(exam_type=exam_type)
    subjects: list[str] = []
    for file_path in files:
        data = load_dataset_file(file_path)
        if data:
            subjects.append(data["subject"])
    return subjects


def get_flashcard_pairs_for_subject(exam_type: str, subject: str) -> list[dict[str, str]]:
    """
    Convert dataset questions for a subject into flashcard front/back pairs.

    Front  = the question text
    Back   = correct answer choice + explanation
    """
    files = get_dataset_files(exam_type=exam_type)
    for file_path in files:
        data = load_dataset_file(file_path)
        if data and data.get("subject") == subject:
            return _questions_to_flashcard_pairs(data.get("questions", []))
    return []


def _questions_to_flashcard_pairs(questions: list[dict[str, Any]]) -> list[dict[str, str]]:
    """Internal: convert raw question dicts to {"front", "back", "topic"} pairs."""
    pairs: list[dict[str, str]] = []
    for q in questions:
        choices = q.get("choices", {})
        correct_key = q.get("correct_answer", "A")
        correct_text = choices.get(correct_key, "")
        explanation = q.get("explanation", "")

        back_parts = [f"Answer: {correct_text}"]
        if explanation:
            back_parts.append(f"\n{explanation}")

        pairs.append({
            "front": q.get("question", ""),
            "back": "\n".join(back_parts),
            "topic": q.get("topic", ""),
        })
    return pairs
