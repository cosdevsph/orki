"""
generate_explanations.py — AI-powered explanation enhancement.

Enriches existing question explanations or generates new ones for questions
that lack detailed explanations.
"""
from __future__ import annotations

import logging

logger = logging.getLogger(__name__)


def generate_explanation(
    question: str,
    correct_answer: str,
    subject: str,
    exam_type: str,
) -> str:
    """
    Generate or improve the explanation for a single question.

    Returns an empty string if OpenAI is not configured.
    """
    try:
        import openai  # noqa: PLC0415
    except ImportError:
        logger.warning("openai package not installed.")
        return ""

    import os  # noqa: PLC0415

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return ""

    client = openai.OpenAI(api_key=api_key)
    prompt = (
        f"For the {exam_type} board exam ({subject}):\n"
        f"Question: {question}\n"
        f"Correct answer: {correct_answer}\n\n"
        "Write a clear, concise explanation (2-4 sentences) of why this answer is correct "
        "and what the student should remember. Use plain English."
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=300,
        )
        return response.choices[0].message.content.strip()
    except Exception as exc:
        logger.exception("OpenAI explanation generation failed: %s", exc)
        return ""
