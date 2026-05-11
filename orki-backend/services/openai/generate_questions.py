"""
generate_questions.py — AI-powered board exam question generation.

Reads topic/subject/exam_type metadata and calls the OpenAI API to produce
properly formatted board-style questions matching the Orki dataset schema.

Future integration steps:
1. Set OPENAI_API_KEY in .env
2. pip install openai
3. Uncomment the implementation below and remove the stub
"""
from __future__ import annotations

import json
import logging
from typing import Any

logger = logging.getLogger(__name__)

# ─── Orki Dataset Schema ──────────────────────────────────────────────────────
#
# Each generated question must conform to this structure so it can be merged
# directly into the JSON dataset files and loaded into the database.
#
# {
#   "id": "ENG-011",               # Unique ID: SUBJECT_ABBR-NNN
#   "topic": "Grammar",
#   "difficulty": "Medium",        # Easy | Medium | Hard
#   "question": "...",
#   "choices": { "A": "...", "B": "...", "C": "...", "D": "..." },
#   "correct_answer": "C",         # A | B | C | D
#   "explanation": "...",
#   "tags": ["grammar", "..."]
# }

SYSTEM_PROMPT = """You are an expert Philippine board examination question writer.
Generate high-quality, board-style multiple-choice questions following these rules:
1. Each question must have exactly 4 choices (A, B, C, D)
2. Only one choice is correct
3. Include a detailed explanation of the correct answer
4. Match the difficulty level requested
5. Questions must be factually accurate and appropriate for Philippine licensure exams
6. Return a valid JSON array matching the Orki dataset schema
"""


def generate_board_questions(
    exam_type: str,
    subject: str,
    topic: str,
    difficulty: str = "Medium",
    count: int = 5,
    existing_ids: list[str] | None = None,
) -> list[dict[str, Any]]:
    """
    Generate board-style questions using OpenAI GPT.

    Args:
        exam_type:    e.g. "LEPT", "CSE", "PmLE", "CLE"
        subject:      e.g. "Mathematics", "Verbal Ability"
        topic:        e.g. "Algebra", "Vocabulary"
        difficulty:   "Easy" | "Medium" | "Hard"
        count:        Number of questions to generate (1-20)
        existing_ids: List of existing question IDs to avoid duplication

    Returns:
        List of question dicts conforming to the Orki dataset schema.
        Returns empty list if OpenAI is not configured.
    """
    try:
        import openai  # noqa: PLC0415 — deferred import, not required at startup
    except ImportError:
        logger.warning("openai package not installed. Run: pip install openai")
        return []

    import os  # noqa: PLC0415

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        logger.warning("OPENAI_API_KEY not set in environment. Skipping question generation.")
        return []

    client = openai.OpenAI(api_key=api_key)
    existing_str = f"Avoid these IDs: {existing_ids}" if existing_ids else ""

    user_prompt = f"""Generate {count} {difficulty} difficulty board exam questions for:
Exam Type: {exam_type}
Subject: {subject}
Topic: {topic}
{existing_str}

Return a JSON array of question objects matching this schema:
[{{
  "id": "UNIQUE-ID",
  "topic": "{topic}",
  "difficulty": "{difficulty}",
  "question": "...",
  "choices": {{"A": "...", "B": "...", "C": "...", "D": "..."}},
  "correct_answer": "X",
  "explanation": "...",
  "tags": ["tag1", "tag2"]
}}]
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=4096,
        )
        content = response.choices[0].message.content
        parsed = json.loads(content)
        # Handle both {"questions": [...]} and direct array responses
        if isinstance(parsed, list):
            return parsed
        return parsed.get("questions", parsed.get("items", []))
    except Exception as exc:
        logger.exception("OpenAI question generation failed: %s", exc)
        return []
