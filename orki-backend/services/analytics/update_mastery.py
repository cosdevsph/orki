"""
update_mastery.py — Analytics engine: subject mastery and topic accuracy updater.

Called after every exam attempt submission to keep analytics records
in sync with the user's latest performance data.
"""
from __future__ import annotations

import logging
from datetime import date

logger = logging.getLogger(__name__)


def update_analytics_from_attempt(attempt) -> None:
    """
    Update SubjectMastery, TopicAccuracy, and DailyStreak after an exam attempt.

    Args:
        attempt: A completed ExamAttempt instance.
    """
    from analytics.models import DailyStreak, SubjectMastery, TopicAccuracy  # noqa: PLC0415

    profile = attempt.user
    exam_type = profile.exam_type or ""
    answers = attempt.answers.select_related("question").all()

    # Group answers by subject (using question.category as subject proxy)
    subject_stats: dict[str, dict[str, int]] = {}
    topic_stats: dict[tuple[str, str], dict[str, int]] = {}

    for answer in answers:
        question = answer.question
        subject = question.mock_exam.subject if hasattr(question.mock_exam, "subject") else (question.category or "General")
        topic = question.category or "General"

        # Subject-level aggregation
        if subject not in subject_stats:
            subject_stats[subject] = {"correct": 0, "total": 0}
        subject_stats[subject]["total"] += 1
        if answer.is_correct:
            subject_stats[subject]["correct"] += 1

        # Topic-level aggregation
        key = (subject, topic)
        if key not in topic_stats:
            topic_stats[key] = {"correct": 0, "total": 0}
        topic_stats[key]["total"] += 1
        if answer.is_correct:
            topic_stats[key]["correct"] += 1

    # Upsert SubjectMastery records
    for subject, stats in subject_stats.items():
        mastery, _ = SubjectMastery.objects.get_or_create(
            user=profile,
            exam_type=exam_type,
            subject=subject,
        )
        mastery.total_questions_attempted += stats["total"]
        mastery.total_questions_correct += stats["correct"]
        if mastery.total_questions_attempted > 0:
            mastery.mastery_percentage = round(
                (mastery.total_questions_correct / mastery.total_questions_attempted) * 100, 2
            )
        mastery.save()

    # Upsert TopicAccuracy records
    for (subject, topic), stats in topic_stats.items():
        topic_acc, _ = TopicAccuracy.objects.get_or_create(
            user=profile,
            exam_type=exam_type,
            subject=subject,
            topic=topic,
        )
        topic_acc.correct_count += stats["correct"]
        topic_acc.total_count += stats["total"]
        if topic_acc.total_count > 0:
            topic_acc.accuracy_percentage = round(
                (topic_acc.correct_count / topic_acc.total_count) * 100, 2
            )
        topic_acc.save()

    # Update AnalyticsPoint trend
    from analytics.models import AnalyticsPoint  # noqa: PLC0415

    AnalyticsPoint.objects.create(
        user=profile,
        label=attempt.completed_at.strftime("%b %d") if attempt.completed_at else "Exam",
        score=attempt.score or 0.0,
    )

    # Update daily streak
    _update_streak(profile)

    logger.info("Analytics updated for user %s after attempt %s.", profile.email, attempt.pk)


def _update_streak(profile) -> None:
    """Increment daily streak if user has not yet been recorded active today."""
    from analytics.models import DailyStreak  # noqa: PLC0415

    today = date.today()
    streak, _ = DailyStreak.objects.get_or_create(user=profile)

    if streak.last_active_date == today:
        return  # Already recorded today

    if streak.last_active_date is not None:
        delta = (today - streak.last_active_date).days
        if delta == 1:
            streak.current_streak += 1
        else:
            streak.current_streak = 1
    else:
        streak.current_streak = 1

    if streak.current_streak > streak.longest_streak:
        streak.longest_streak = streak.current_streak

    streak.last_active_date = today
    streak.save()
