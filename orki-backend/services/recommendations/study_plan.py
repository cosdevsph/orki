"""
study_plan.py — Personalized study plan generator.

Uses the user's subject mastery, weak topics, exam date, and study history
to generate a prioritized study plan. Designed to be consumed by the
dashboard's "Study Plan" widget (future feature).
"""
from __future__ import annotations

from datetime import date
from typing import Any


def generate_study_plan(user_profile) -> list[dict[str, Any]]:
    """
    Generate a prioritized study plan for the user.

    Priority factors:
    1. Subjects with mastery < 60% (high priority)
    2. Time remaining until exam date
    3. Number of weak topics per subject

    Returns a list of study tasks ordered by priority.
    """
    from analytics.models import SubjectMastery, TopicAccuracy  # noqa: PLC0415

    exam_type = user_profile.exam_type or ""
    exam_date = user_profile.exam_date
    days_until_exam = (exam_date - date.today()).days if exam_date else None

    masteries = SubjectMastery.objects.filter(
        user=user_profile,
        exam_type=exam_type,
    ).order_by("mastery_percentage")

    plan = []
    for mastery in masteries:
        weak_topics = list(
            TopicAccuracy.objects.filter(
                user=user_profile,
                exam_type=exam_type,
                subject=mastery.subject,
                total_count__gte=3,
                accuracy_percentage__lt=60.0,
            ).values_list("topic", flat=True)
        )

        priority = "high" if mastery.mastery_percentage < 60 else (
            "medium" if mastery.mastery_percentage < 80 else "low"
        )

        plan.append({
            "subject": mastery.subject,
            "mastery_percentage": mastery.mastery_percentage,
            "priority": priority,
            "weak_topics": weak_topics,
            "recommended_sessions": max(1, len(weak_topics)),
            "days_until_exam": days_until_exam,
        })

    return plan
