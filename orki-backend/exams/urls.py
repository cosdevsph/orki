from django.urls import path

from .views import (
    ExamAttemptAnswerView,
    ExamAttemptResultView,
    ExamAttemptStartView,
    ExamAttemptSubmitView,
    ExamDetailView,
    ExamListView,
    MockExamCatalogView,
    MockExamDetailView,
)

urlpatterns = [
    path("exams/", ExamListView.as_view(), name="exam-list"),
    path("exams/<int:pk>/", ExamDetailView.as_view(), name="exam-detail"),
    path("exams/catalog/", MockExamCatalogView.as_view(), name="mock-exam-catalog"),
    path("exams/catalog/<int:pk>/", MockExamDetailView.as_view(), name="mock-exam-detail"),
    path("exams/catalog/<int:pk>/start/", ExamAttemptStartView.as_view(), name="exam-start"),
    path("exams/attempts/<int:attempt_pk>/answer/", ExamAttemptAnswerView.as_view(), name="exam-answer"),
    path("exams/attempts/<int:attempt_pk>/submit/", ExamAttemptSubmitView.as_view(), name="exam-submit"),
    path("exams/attempts/<int:attempt_pk>/results/", ExamAttemptResultView.as_view(), name="exam-results"),
]
