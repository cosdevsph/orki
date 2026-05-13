"""
validators.py — Dataset schema validator for Orki examination datasets.

Validates JSON question files before import to Firestore.
Each validator returns a list of ValidationError instances.

Usage::

    from services.datasets.validators import validate_dataset

    errors = validate_dataset(data, source_path="english.json", exam_type="LEPT", subject="English")
    if errors:
        for e in errors:
            print(e)
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


# ─── Error Model ──────────────────────────────────────────────────────────────

@dataclass
class ValidationError:
    source: str
    question_id: str | None
    field: str
    message: str

    def __str__(self) -> str:
        loc = f"[{self.question_id}]" if self.question_id else "[unknown]"
        return f"{self.source} {loc} {self.field}: {self.message}"


@dataclass
class ValidationResult:
    source: str
    errors: list[ValidationError] = field(default_factory=list)
    warnings: list[ValidationError] = field(default_factory=list)

    @property
    def is_valid(self) -> bool:
        return len(self.errors) == 0

    def __str__(self) -> str:
        lines = [f"=== {self.source} ==="]
        if self.errors:
            lines.append(f"  ERRORS ({len(self.errors)}):")
            lines.extend(f"    {e}" for e in self.errors)
        if self.warnings:
            lines.append(f"  WARNINGS ({len(self.warnings)}):")
            lines.extend(f"    {w}" for w in self.warnings)
        if not self.errors and not self.warnings:
            lines.append("  OK")
        return "\n".join(lines)


# ─── Valid values ─────────────────────────────────────────────────────────────

VALID_ANSWERS = {"A", "B", "C", "D"}
VALID_DIFFICULTIES = {"Easy", "Medium", "Hard"}
VALID_EXAM_TYPES = {"LEPT", "CSE", "PmLE", "CLE"}
REQUIRED_CHOICES = {"A", "B"}          # C and D are optional (true/false questions)


# ─── Core Validator ───────────────────────────────────────────────────────────

def validate_question(
    q: Any,
    source: str,
    seen_ids: set[str],
) -> tuple[list[ValidationError], list[ValidationError]]:
    """
    Validate a single question dict.

    Returns (errors, warnings).
    """
    errors: list[ValidationError] = []
    warnings: list[ValidationError] = []

    if not isinstance(q, dict):
        errors.append(ValidationError(source, None, "structure", "Question must be a JSON object"))
        return errors, warnings

    q_id = q.get("id") or q.get("question_id")

    # ── Required fields ───────────────────────────────────────────────────────
    if not q_id:
        errors.append(ValidationError(source, None, "id", "Missing required field 'id'"))
    else:
        # Duplicate ID check within the same file
        if q_id in seen_ids:
            errors.append(ValidationError(source, q_id, "id", f"Duplicate question ID '{q_id}'"))
        seen_ids.add(str(q_id))

    question_text = q.get("question") or q.get("question_text")
    if not question_text or not str(question_text).strip():
        errors.append(ValidationError(source, q_id, "question", "Missing or empty question text"))

    # ── Choices ───────────────────────────────────────────────────────────────
    choices = q.get("choices")
    if not isinstance(choices, dict):
        errors.append(ValidationError(source, q_id, "choices", "Missing or malformed 'choices' (expected object)"))
    else:
        for key in REQUIRED_CHOICES:
            if key not in choices or not str(choices[key]).strip():
                errors.append(ValidationError(source, q_id, f"choices.{key}", f"Choice '{key}' is missing or empty"))

    # ── Correct answer ────────────────────────────────────────────────────────
    correct = q.get("correct_answer")
    if not correct:
        errors.append(ValidationError(source, q_id, "correct_answer", "Missing 'correct_answer'"))
    elif str(correct).upper() not in VALID_ANSWERS:
        errors.append(ValidationError(source, q_id, "correct_answer", f"Invalid answer '{correct}' — must be A, B, C or D"))
    elif isinstance(choices, dict) and str(correct).upper() not in choices:
        errors.append(ValidationError(source, q_id, "correct_answer", f"Answer '{correct}' has no matching choice"))

    # ── Difficulty ────────────────────────────────────────────────────────────
    difficulty = q.get("difficulty")
    if difficulty and difficulty not in VALID_DIFFICULTIES:
        warnings.append(ValidationError(source, q_id, "difficulty", f"Unexpected difficulty '{difficulty}' — expected one of {VALID_DIFFICULTIES}"))

    # ── Soft warnings ─────────────────────────────────────────────────────────
    if not q.get("explanation"):
        warnings.append(ValidationError(source, q_id, "explanation", "Missing explanation — recommended for learning feedback"))

    if not q.get("topic"):
        warnings.append(ValidationError(source, q_id, "topic", "Missing topic — required for analytics"))

    if not q.get("tags"):
        warnings.append(ValidationError(source, q_id, "tags", "Missing tags — useful for search and recommendations"))

    return errors, warnings


def validate_dataset(
    data: Any,
    source_path: str,
    exam_type: str,
    subject: str,
) -> ValidationResult:
    """
    Validate a parsed dataset (either a list of questions or a wrapped object).

    Args:
        data:        Parsed JSON data (list or dict).
        source_path: File path or label for error messages.
        exam_type:   Exam type code (LEPT, CSE, PmLE, CLE).
        subject:     Subject name.

    Returns:
        A ValidationResult with all errors and warnings found.
    """
    result = ValidationResult(source=source_path)

    # ── Top-level structure ───────────────────────────────────────────────────
    if isinstance(data, dict):
        questions = data.get("questions", [])
        # Validate exam_type consistency
        json_exam_type = data.get("exam_type")
        if json_exam_type and json_exam_type != exam_type:
            result.warnings.append(ValidationError(
                source_path, None, "exam_type",
                f"JSON exam_type '{json_exam_type}' differs from inferred '{exam_type}'",
            ))
    elif isinstance(data, list):
        questions = data
    else:
        result.errors.append(ValidationError(
            source_path, None, "structure",
            "Root must be a JSON object with 'questions' key or a JSON array",
        ))
        return result

    if not questions:
        result.errors.append(ValidationError(source_path, None, "questions", "Dataset contains no questions"))
        return result

    if not isinstance(questions, list):
        result.errors.append(ValidationError(source_path, None, "questions", "'questions' must be an array"))
        return result

    # ── Validate exam_type value ──────────────────────────────────────────────
    if exam_type not in VALID_EXAM_TYPES:
        result.warnings.append(ValidationError(
            source_path, None, "exam_type",
            f"'{exam_type}' is not a recognised exam type — expected one of {VALID_EXAM_TYPES}",
        ))

    # ── Validate each question ────────────────────────────────────────────────
    seen_ids: set[str] = set()
    for q in questions:
        q_errors, q_warnings = validate_question(q, source_path, seen_ids)
        result.errors.extend(q_errors)
        result.warnings.extend(q_warnings)

    return result


def validate_file(path: Path, exam_type: str, subject: str) -> ValidationResult:
    """
    Load and validate a single dataset JSON file.

    Catches and reports malformed JSON as a hard error.
    """
    source = str(path)
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as exc:
        result = ValidationResult(source=source)
        result.errors.append(ValidationError(source, None, "json_parse", f"Malformed JSON: {exc}"))
        return result
    except OSError as exc:
        result = ValidationResult(source=source)
        result.errors.append(ValidationError(source, None, "file_read", f"Cannot read file: {exc}"))
        return result

    return validate_dataset(data, source, exam_type, subject)
