from django.contrib import admin

from .models import AnalyticsPoint, DailyStreak, StudySession, SubjectMastery, TopicAccuracy


@admin.register(AnalyticsPoint)
class AnalyticsPointAdmin(admin.ModelAdmin):
    list_display = ("label", "score", "user", "recorded_at")
    search_fields = ("user__email",)


@admin.register(SubjectMastery)
class SubjectMasteryAdmin(admin.ModelAdmin):
    list_display = ("subject", "exam_type", "mastery_percentage", "total_questions_attempted", "user", "last_updated")
    list_filter = ("exam_type",)
    search_fields = ("user__email", "subject")


@admin.register(TopicAccuracy)
class TopicAccuracyAdmin(admin.ModelAdmin):
    list_display = ("topic", "subject", "exam_type", "accuracy_percentage", "total_count", "user", "last_updated")
    list_filter = ("exam_type", "subject")
    search_fields = ("user__email", "topic")


@admin.register(StudySession)
class StudySessionAdmin(admin.ModelAdmin):
    list_display = ("user", "session_type", "duration_seconds", "started_at", "ended_at")
    list_filter = ("session_type",)
    search_fields = ("user__email",)


@admin.register(DailyStreak)
class DailyStreakAdmin(admin.ModelAdmin):
    list_display = ("user", "current_streak", "longest_streak", "last_active_date", "updated_at")
    search_fields = ("user__email",)
