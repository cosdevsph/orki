from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsSessionAuthenticated

from .models import Exam
from .serializers import ExamSerializer


class ExamListView(APIView):
    """
    GET  /api/v1/exams/  — List all exams for the authenticated user.
    POST /api/v1/exams/  — Create a new exam.
    """

    permission_classes = [IsSessionAuthenticated]

    def get(self, request):
        exams = Exam.objects.filter(user=request.user_profile)
        return Response(ExamSerializer(exams, many=True).data)

    def post(self, request):
        serializer = ExamSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=201)


class ExamDetailView(APIView):
    """
    GET   /api/v1/exams/<pk>/  — Retrieve a single exam.
    PATCH /api/v1/exams/<pk>/  — Update exam status / score.
    """

    permission_classes = [IsSessionAuthenticated]

    def _get_exam(self, pk, user_profile):
        try:
            return Exam.objects.get(pk=pk, user=user_profile)
        except Exam.DoesNotExist:
            return None

    def get(self, request, pk):
        exam = self._get_exam(pk, request.user_profile)
        if exam is None:
            return Response({"detail": "Not found."}, status=404)
        return Response(ExamSerializer(exam).data)

    def patch(self, request, pk):
        exam = self._get_exam(pk, request.user_profile)
        if exam is None:
            return Response({"detail": "Not found."}, status=404)
        serializer = ExamSerializer(exam, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
