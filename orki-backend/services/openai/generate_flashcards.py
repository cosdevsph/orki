"""
generate_flashcards.py — AI-powered flashcard generation from exam questions.

Converts question/answer pairs from the Orki dataset into Anki-style flashcards
optimized for spaced repetition learning.
"""
from __future__ import annotations

import json
import logging
from typing import Any

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert study material creator for Philippine board exams.
Convert exam questions into concise, effective flashcard pairs suitable for spaced repetition.
Rules:
1. Front: A clear, focused question or concept prompt
2. Back: A concise, memorable answer (not a full paragraph)
3. Keep each flashcard focused on ONE concept
4. Use mnemonics or memorable phrases where appropriate
5. Return valid JSON array
"""


def generate_flashcards_from_questions(
    questions: list[dict[str, Any]],
    subject: str,
    exam_type: str,
) -> list[dict[str, str]]:
    """
    Generate flashcard pairs from a list of exam questions using OpenAI.

    Args:
        questions:  List of question dicts from the Orki dataset schema
        subject:    Subject name for context
        exam_type:  Exam type for context

    Returns:
        List of {"front": "...", "back": "..."} dicts ready for Deck creation.
        Returns empty list if OpenAI is not configured.
    """
    try:
        import openai  # noqa: PLC0415
    except ImportError:
        logger.warning("openai package not installed. Run: pip install openai")
        return []

    import os  # noqa: PLC0415

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        logger.warning("OPENAI_API_KEY not set. Skipping flashcard generation.")
        return []

    client = openai.OpenAI(api_key=api_key)

    # Summarize questions for the prompt (avoid exceeding token limits)
    question_summaries = [
        {
            "question": q.get("question", ""),
            "correct_answer": q.get("choices", {}).get(q.get("correct_answer", ""), ""),
            "explanation": q.get("explanation", ""),
            "topic": q.get("topic", ""),
        }
        for q in questions[:20]  # cap at 20 to stay within token limits
    ]

    user_prompt = f"""Create flashcards for {exam_type} — {subject} from these questions:
{json.dumps(question_summaries, indent=2)}

Return a JSON array:
[{{"front": "...", "back": "...", "topic": "..."}}]
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.5,
            max_tokens=2048,
        )
        content = response.choices[0].message.content
        parsed = json.loads(content)
        if isinstance(parsed, list):
            return parsed
        return parsed.get("flashcards", parsed.get("cards", []))
    except Exception as exc:
        logger.exception("OpenAI flashcard generation failed: %s", exc)
        return []
