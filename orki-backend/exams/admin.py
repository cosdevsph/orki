from django.contrib import admin

from .models import Exam


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "status", "scheduled_at", "score")
    list_filter = ("status",)
    search_fields = ("title", "user__email")
