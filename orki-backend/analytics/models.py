from django.db import models

from users.models import UserProfile


class AnalyticsPoint(models.Model):
    """A single score data-point in a user's performance trend."""

    user = models.ForeignKey(
        UserProfile, on_delete=models.CASCADE, related_name="analytics_points"
    )
    label = models.CharField(max_length=100)   # e.g. "Week 1", "May 6"
    score = models.FloatField()                # 0–100
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "analytics_points"
        ordering = ["recorded_at"]

    def __str__(self) -> str:
        return f"{self.label}: {self.score} ({self.user.email})"


class SubjectMastery(models.Model):
    """
    Tracks a user's mastery level per subject within their exam type.

    Updated automatically after each exam attempt and flashcard review session.
    Drives the Subject Mastery widget on the dashboard and
    future AI recommendation systems.
    """

    user = models.ForeignKey(
        UserProfile, on_delete=models.CASCADE, related_name="subject_masteries"
    )
    exam_type = models.CharField(max_length=20)   # e.g. "LEPT", "CSE"
    subject = models.CharField(max_length=100)    # e.g. "Mathematics", "Verbal"
    mastery_percentage = models.FloatField(default=0.0)    # 0.0 – 100.0
    total_questions_attempted = models.PositiveIntegerField(default=0)
    total_questions_correct = models.PositiveIntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "subject_masteries"
        unique_together = ["user", "exam_type", "subject"]
        ordering = ["-mastery_percentage"]

    def __str__(self) -> str:
        return f"{self.subject} ({self.exam_type}): {self.mastery_percentage:.1f}% — {self.user.email}"


class TopicAccuracy(models.Model):
    """
    Per-topic accuracy within a subject.

    Identifies weak and strong topics for personalized recommendations
    and adaptive quiz generation (future OpenAI integration).
    """

    user = models.ForeignKey(
        UserProfile, on_delete=models.CASCADE, related_name="topic_accuracies"
    )
    exam_type = models.CharField(max_length=20)
    subject = models.CharField(max_length=100)
    topic = models.CharField(max_length=150)
    correct_count = models.PositiveIntegerField(default=0)
    total_count = models.PositiveIntegerField(default=0)
    accuracy_percentage = models.FloatField(default=0.0)   # 0.0 – 100.0
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "topic_accuracies"
        unique_together = ["user", "exam_type", "subject", "topic"]
        ordering = ["accuracy_percentage"]

    @property
    def is_weak(self) -> bool:
        """A topic is considered weak if accuracy is below 60%."""
        return self.total_count >= 3 and self.accuracy_percentage < 60.0

    @property
    def is_strong(self) -> bool:
        """A topic is considered strong if accuracy is 80% or above."""
        return self.total_count >= 3 and self.accuracy_percentage >= 80.0

    def __str__(self) -> str:
        return f"{self.topic}: {self.accuracy_percentage:.1f}% ({self.user.email})"


class StudySession(models.Model):
    """
    Records a single study session for streak and weekly hours tracking.

    A session can be initiated by:
    - Starting a mock exam attempt
    - Reviewing flashcards
    - Future: AI quiz sessions
    """

    SESSION_TYPES = [
        ("exam", "Mock Exam"),
        ("flashcard", "Flashcard Review"),
        ("quiz", "Adaptive Quiz"),
    ]

    user = models.ForeignKey(
        UserProfile, on_delete=models.CASCADE, related_name="study_sessions"
    )
    session_type = models.CharField(max_length=20, choices=SESSION_TYPES)
    exam_type = models.CharField(max_length=20, blank=True)
    subject = models.CharField(max_length=100, blank=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "study_sessions"
        ordering = ["-started_at"]

    def __str__(self) -> str:
        return f"{self.session_type} session — {self.user.email} ({self.started_at.date()})"


class DailyStreak(models.Model):
    """
    Maintains the current and longest study streak for a user.

    Updated at the end of each study session or exam attempt.
    Used by the dashboard streak widget.
    """

    user = models.OneToOneField(
        UserProfile, on_delete=models.CASCADE, related_name="daily_streak"
    )
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "daily_streaks"

    def __str__(self) -> str:
        return f"{self.user.email}: {self.current_streak}-day streak"
