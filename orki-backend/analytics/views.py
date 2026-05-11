from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsSessionAuthenticated

from .models import AnalyticsPoint, DailyStreak, SubjectMastery, TopicAccuracy
from .serializers import (
    AnalyticsPointSerializer,
    DailyStreakSerializer,
    SubjectMasterySerializer,
    TopicAccuracySerializer,
)


class AnalyticsOverviewView(APIView):
    """
    GET /api/v1/analytics/
    Returns average score, mastery level, score trend, and subject mastery
    for the authenticated user.
    """

    permission_classes = [IsSessionAuthenticated]

    def get(self, request):
        profile = request.user_profile
        points = AnalyticsPoint.objects.filter(user=profile).order_by("recorded_at")

        trend = AnalyticsPointSerializer(points, many=True).data
        scores = [p.score for p in points]

        if scores:
            average_score = round(sum(scores) / len(scores), 2)
        else:
            average_score = 0.0

        if average_score >= 75:
            mastery_level = "high"
        elif average_score >= 50:
            mastery_level = "medium"
        else:
            mastery_level = "low"

        subject_masteries = SubjectMastery.objects.filter(user=profile)
        subjects_data = SubjectMasterySerializer(subject_masteries, many=True).data

        # Streak
        try:
            streak = DailyStreak.objects.get(user=profile)
            streak_data = DailyStreakSerializer(streak).data
        except DailyStreak.DoesNotExist:
            streak_data = {"current_streak": 0, "longest_streak": 0, "last_active_date": None, "updated_at": None}

        return Response(
            {
                "averageScore": average_score,
                "masteryLevel": mastery_level,
                "trend": trend,
                "subjectMasteries": subjects_data,
                "streak": streak_data,
            }
        )


class SubjectMasteryListView(APIView):
    """
    GET /api/v1/analytics/mastery/
    Returns subject mastery breakdown with weak/strong topics per subject.
    Optionally filter by ?exam_type=LEPT
    """

    permission_classes = [IsSessionAuthenticated]

    def get(self, request):
        profile = request.user_profile
        qs = SubjectMastery.objects.filter(user=profile)

        exam_type = request.query_params.get("exam_type")
        if exam_type:
            qs = qs.filter(exam_type=exam_type)
        else:
            # Default to the user's registered exam type
            if profile.exam_type:
                qs = qs.filter(exam_type=profile.exam_type)

        data = SubjectMasterySerializer(qs, many=True).data
        return Response(data)


class WeakTopicsView(APIView):
    """
    GET /api/v1/analytics/weak-topics/
    Returns topics where the user is struggling (accuracy < 60%, min 3 attempts).
    Supports ?exam_type= and ?subject= filters.
    """

    permission_classes = [IsSessionAuthenticated]

    def get(self, request):
        profile = request.user_profile
        qs = TopicAccuracy.objects.filter(
            user=profile,
            total_count__gte=3,
            accuracy_percentage__lt=60.0,
        ).order_by("accuracy_percentage")

        exam_type = request.query_params.get("exam_type", profile.exam_type)
        if exam_type:
            qs = qs.filter(exam_type=exam_type)

        subject = request.query_params.get("subject")
        if subject:
            qs = qs.filter(subject__icontains=subject)

        data = TopicAccuracySerializer(qs, many=True).data
        return Response({"weakTopics": data, "count": len(data)})


class StrongTopicsView(APIView):
    """
    GET /api/v1/analytics/strong-topics/
    Returns topics where the user is performing well (accuracy >= 80%, min 3 attempts).
    """

    permission_classes = [IsSessionAuthenticated]

    def get(self, request):
        profile = request.user_profile
        qs = TopicAccuracy.objects.filter(
            user=profile,
            total_count__gte=3,
            accuracy_percentage__gte=80.0,
        ).order_by("-accuracy_percentage")

        exam_type = request.query_params.get("exam_type", profile.exam_type)
        if exam_type:
            qs = qs.filter(exam_type=exam_type)

        subject = request.query_params.get("subject")
        if subject:
            qs = qs.filter(subject__icontains=subject)

        data = TopicAccuracySerializer(qs, many=True).data
        return Response({"strongTopics": data, "count": len(data)})


class DailyStreakView(APIView):
    """
    GET /api/v1/analytics/streak/
    Returns the authenticated user's current and longest study streak.
    """

    permission_classes = [IsSessionAuthenticated]

    def get(self, request):
        try:
            streak = DailyStreak.objects.get(user=request.user_profile)
            return Response(DailyStreakSerializer(streak).data)
        except DailyStreak.DoesNotExist:
            return Response({
                "current_streak": 0,
                "longest_streak": 0,
                "last_active_date": None,
                "updated_at": None,
            })
