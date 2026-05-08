from django.db import models

from users.models import UserProfile


class Exam(models.Model):
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
