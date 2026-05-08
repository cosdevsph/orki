from datetime import timedelta

from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsSessionAuthenticated
from exams.models import Exam
from flashcards.models import Flashcard


class DashboardSummaryView(APIView):
    """
    GET /api/v1/dashboard/
    Aggregates key metrics for the authenticated user's dashboard.
    """

    permission_classes = [IsSessionAuthenticated]

    def get(self, request):
        profile = request.user_profile
        now = timezone.now()

        due_flashcards = Flashcard.objects.filter(
            deck__user=profile, is_due=True
        ).count()

        upcoming_exams = Exam.objects.filter(
            user=profile,
            status="scheduled",
            scheduled_at__gte=now,
        ).count()

        # Streak and weekly hours require a StudySession model (future feature).
        active_streak_days = 0
        weekly_study_hours = 0

        return Response(
            {
                "activeStreakDays": active_streak_days,
                "dueFlashcards": due_flashcards,
                "upcomingExams": upcoming_exams,
                "weeklyStudyHours": weekly_study_hours,
            }
        )
