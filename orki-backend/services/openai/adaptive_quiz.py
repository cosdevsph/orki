"""
adaptive_quiz.py — Adaptive quiz generation based on user weak topics.

Queries the user's TopicAccuracy records to identify weak areas,
then generates a personalized quiz using OpenAI targeting those topics.
"""
from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)


def generate_adaptive_quiz(
    user_profile,
    question_count: int = 10,
) -> list[dict[str, Any]]:
    """
    Generate a personalized adaptive quiz based on the user's weak topics.

    Args:
        user_profile:    UserProfile instance
        question_count:  Number of questions to generate

    Returns:
        List of question dicts in Orki dataset schema format.
        Prioritizes topics where accuracy < 60%.
    """
    from analytics.models import TopicAccuracy  # noqa: PLC0415 — avoid circular at module level
    from services.openai.generate_questions import generate_board_questions  # noqa: PLC0415

    weak_topics = list(
        TopicAccuracy.objects.filter(
            user=user_profile,
            total_count__gte=3,
            accuracy_percentage__lt=60.0,
        ).order_by("accuracy_percentage")[:5]
    )

    if not weak_topics:
        logger.info("No weak topics found for user %s — no adaptive quiz generated.", user_profile.email)
        return []

    questions: list[dict[str, Any]] = []
    per_topic = max(1, question_count // len(weak_topics))

    for topic_stat in weak_topics:
        generated = generate_board_questions(
            exam_type=topic_stat.exam_type,
            subject=topic_stat.subject,
            topic=topic_stat.topic,
            difficulty="Medium",
            count=per_topic,
        )
        questions.extend(generated)
        if len(questions) >= question_count:
            break

    return questions[:question_count]
