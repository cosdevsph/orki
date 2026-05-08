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
