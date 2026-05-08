from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsSessionAuthenticated

from .models import AnalyticsPoint
from .serializers import AnalyticsPointSerializer


class AnalyticsOverviewView(APIView):
    """
    GET /api/v1/analytics/
    Returns average score, mastery level, and a score trend for the user.
    """

    permission_classes = [IsSessionAuthenticated]

    def get(self, request):
        points = AnalyticsPoint.objects.filter(user=request.user_profile).order_by("recorded_at")

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

        return Response(
            {
                "averageScore": average_score,
                "masteryLevel": mastery_level,
                "trend": trend,
            }
        )
