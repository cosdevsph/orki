from django.contrib import admin

from .models import ExamAnswer, ExamAttempt, MockExam, MockExamQuestion, Exam


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ["title", "user", "status", "score", "scheduled_at"]


@admin.register(MockExam)
class MockExamAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "difficulty", "question_count", "duration_minutes", "is_active"]
    list_filter = ["category", "difficulty", "is_active"]


class MockExamQuestionInline(admin.TabularInline):
    model = MockExamQuestion
    extra = 1


@admin.register(MockExamQuestion)
class MockExamQuestionAdmin(admin.ModelAdmin):
    list_display = ["mock_exam", "order", "question_type", "category"]
    list_filter = ["mock_exam", "question_type"]


@admin.register(ExamAttempt)
class ExamAttemptAdmin(admin.ModelAdmin):
    list_display = ["user", "mock_exam", "status", "score", "started_at"]
    list_filter = ["status"]


@admin.register(ExamAnswer)
class ExamAnswerAdmin(admin.ModelAdmin):
    list_display = ["attempt", "question", "selected_answer", "is_correct"]
