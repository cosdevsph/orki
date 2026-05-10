from datetime import timedelta

from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsSessionAuthenticated
from exams.models import Exam, ExamAttempt
from flashcards.models import Flashcard


class DashboardSummaryView(APIView):
    """
    GET /api/v1/dashboard/
    Aggregates key metrics for the authenticated user's dashboard,
    including overall readiness and recent activity.
    """

    permission_classes = [IsSessionAuthenticated]

    def get(self, request):
        profile = request.user_profile
        now = timezone.now()

        due_flashcards = Flashcard.objects.filter(
            deck__user=profile,
            next_review__lte=now,
        ).count()

        upcoming_exams = Exam.objects.filter(
            user=profile,
            status="scheduled",
            scheduled_at__gte=now,
        ).count()

        # ── Overall Readiness ──────────────────────────────────────────────
        # Based on average score of completed mock exam attempts
        completed_attempts = ExamAttempt.objects.filter(
            user=profile,
            status="completed",
        )
        
        scores = list(completed_attempts.values_list("score", flat=True))
        if scores:
            overall_readiness = round(sum(scores) / len(scores), 1)
        else:
            overall_readiness = 0

        # ── Study Streak ──────────────────────────────────────────────────
        # Count consecutive days with activity (flashcard reviews or exam attempts)
        active_streak_days = 0
        check_date = now.date()
        for _ in range(365):
            has_review = Flashcard.objects.filter(
                deck__user=profile,
                last_reviewed__date=check_date,
            ).exists()
            has_exam = ExamAttempt.objects.filter(
                user=profile,
                completed_at__date=check_date,
            ).exists()
            if has_review or has_exam:
                active_streak_days += 1
                check_date -= timedelta(days=1)
            else:
                break

        # Streak and weekly hours
        weekly_study_hours = 0

        # ── Recent Activity ────────────────────────────────────────────────
        recent_activities = []
        
        # Recent exam completions
        recent_exams = completed_attempts.order_by("-completed_at")[:5]
        for attempt in recent_exams:
            recent_activities.append({
                "type": "exam_completed",
                "title": f"Completed {attempt.mock_exam.title}",
                "subtitle": f"Score: {attempt.score}%",
                "timestamp": attempt.completed_at.isoformat() if attempt.completed_at else "",
                "icon": "exam",
            })
        
        # Recent flashcard reviews
        recent_reviews = Flashcard.objects.filter(
            deck__user=profile,
            last_reviewed__isnull=False,
        ).select_related("deck").order_by("-last_reviewed")[:5]
        
        for card in recent_reviews:
            recent_activities.append({
                "type": "flashcard_reviewed",
                "title": f"Reviewed {card.deck.name}",
                "subtitle": f"Card reviewed",
                "timestamp": card.last_reviewed.isoformat() if card.last_reviewed else "",
                "icon": "flashcard",
            })
        
        # Sort by timestamp and take top 5
        recent_activities.sort(key=lambda x: x["timestamp"], reverse=True)
        recent_activities = recent_activities[:5]

        return Response(
            {
                "activeStreakDays": active_streak_days,
                "dueFlashcards": due_flashcards,
                "upcomingExams": upcoming_exams,
                "weeklyStudyHours": weekly_study_hours,
                "overallReadiness": overall_readiness,
                "recentActivity": recent_activities,
            }
        )
