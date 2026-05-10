from django.db import models

from users.models import UserProfile


class Exam(models.Model):
    """A user-scheduled exam (legacy model kept for backward compat)."""

    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
    ]

    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="exams")
    title = models.CharField(max_length=255)
    scheduled_at = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=60)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="scheduled")
    score = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "exams"
        ordering = ["scheduled_at"]

    def __str__(self) -> str:
        return f"{self.title} [{self.status}] — {self.user.email}"


class MockExam(models.Model):
    """
    A catalog-level mock exam template available for all users.
    E.g. "Analytical & Logical Reasoning Mastery"
    """

    CATEGORY_CHOICES = [
        ("CSE_PROF", "CSE Professional"),
        ("CSE_SUBPROF", "CSE Sub-Professional"),
        ("LET_GENED", "LET General Education"),
        ("LET_PROFEDU", "LET Professional Education"),
    ]

    DIFFICULTY_CHOICES = [
        ("beginner", "Beginner"),
        ("intermediate", "Intermediate"),
        ("advanced", "Advanced"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    subject = models.CharField(max_length=100, blank=True)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default="intermediate")
    question_count = models.PositiveIntegerField(default=50)
    duration_minutes = models.PositiveIntegerField(default=60)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "mock_exams"
        ordering = ["category", "title"]

    def __str__(self) -> str:
        return f"{self.title} ({self.get_category_display()})"


class MockExamQuestion(models.Model):
    """A question belonging to a mock exam."""

    QUESTION_TYPES = [
        ("multiple_choice", "Multiple Choice"),
        ("true_false", "True/False"),
    ]

    mock_exam = models.ForeignKey(MockExam, on_delete=models.CASCADE, related_name="questions")
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default="multiple_choice")
    category = models.CharField(max_length=100, blank=True, help_text="Subject/topic category for analytics")
    option_a = models.TextField()
    option_b = models.TextField()
    option_c = models.TextField(blank=True)
    option_d = models.TextField(blank=True)
    correct_answer = models.CharField(max_length=1, help_text="A, B, C, or D")
    explanation = models.TextField(blank=True, help_text="Explanation shown after answering")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "mock_exam_questions"
        ordering = ["order"]

    def __str__(self) -> str:
        return f"Q{self.order}: {self.question_text[:60]}…"


class ExamAttempt(models.Model):
    """A user's attempt at taking a mock exam."""

    STATUS_CHOICES = [
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("abandoned", "Abandoned"),
    ]

    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="exam_attempts")
    mock_exam = models.ForeignKey(MockExam, on_delete=models.CASCADE, related_name="attempts")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="in_progress")
    score = models.FloatField(null=True, blank=True)
    total_correct = models.PositiveIntegerField(default=0)
    total_questions = models.PositiveIntegerField(default=0)
    time_spent_seconds = models.PositiveIntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "exam_attempts"
        ordering = ["-started_at"]

    def __str__(self) -> str:
        return f"{self.user.email} — {self.mock_exam.title} [{self.status}]"


class ExamAnswer(models.Model):
    """A user's answer to a single question in an exam attempt."""

    attempt = models.ForeignKey(ExamAttempt, on_delete=models.CASCADE, related_name="answers")
    question = models.ForeignKey(MockExamQuestion, on_delete=models.CASCADE)
    selected_answer = models.CharField(max_length=1, blank=True)
    is_correct = models.BooleanField(default=False)
    is_marked = models.BooleanField(default=False, help_text="Marked for review")
    answered_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "exam_answers"
        unique_together = ["attempt", "question"]

    def __str__(self) -> str:
        return f"Q{self.question.order}: {self.selected_answer} ({'✓' if self.is_correct else '✗'})"
