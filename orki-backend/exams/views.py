from django.utils import timezone
from rest_framework import status as http_status
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsSessionAuthenticated, IsSubscriber

from .models import Exam, ExamAnswer, ExamAttempt, MockExam, MockExamQuestion
from .serializers import (
    ExamAttemptResultSerializer,
    ExamAttemptSerializer,
    ExamSerializer,
    MockExamDetailSerializer,
    MockExamListSerializer,
    MockExamQuestionWithAnswerSerializer,
)


class ExamListView(APIView):
    """
    GET  /api/v1/exams/  — List all exams for the authenticated user.
    POST /api/v1/exams/  — Create a new exam.
    
    PREMIUM FEATURE: Requires active subscription
    """

    permission_classes = [IsSessionAuthenticated, IsSubscriber]

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
    
    PREMIUM FEATURE: Requires active subscription
    """

    permission_classes = [IsSessionAuthenticated, IsSubscriber]

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


# ─── Mock Exam Catalog ────────────────────────────────────────────────────────

# Maps a user's exam_type to the relevant MockExam category codes.
# Users only see exams relevant to their chosen examination path.
EXAM_TYPE_CATEGORY_MAP = {
    "LEPT": ["LET_GENED", "LET_PROFEDU"],
    "CSE": ["CSE_PROF", "CSE_SUBPROF"],
    "PmLE": ["PMLE_MAIN"],
    "CLE": ["CLE_MAIN"],
}


class MockExamCatalogView(APIView):
    """
    GET /api/v1/exams/catalog/
    Returns the list of available mock exams filtered by the user's exam type
    (unless an explicit ?category= override is provided).
    Requires active subscription.
    """

    permission_classes = [IsSessionAuthenticated, IsSubscriber]

    def get(self, request):
        exams = MockExam.objects.filter(is_active=True)

        category = request.query_params.get("category")
        if category:
            # Explicit category override from the client
            exams = exams.filter(category=category)
        else:
            # Auto-filter by the user's registered exam type.
            # user_profile may be None for Firebase-only users without a
            # local DB row; fall back to returning all exams unfiltered.
            user_exam_type = getattr(request.user_profile, "exam_type", None)
            allowed_cats = EXAM_TYPE_CATEGORY_MAP.get(user_exam_type) if user_exam_type else None
            if allowed_cats:
                exams = exams.filter(category__in=allowed_cats)

        difficulty = request.query_params.get("difficulty")
        if difficulty:
            exams = exams.filter(difficulty=difficulty)

        subject = request.query_params.get("subject")
        if subject:
            exams = exams.filter(subject__icontains=subject)

        serializer = MockExamListSerializer(
            exams, many=True,
            context={"user_profile": request.user_profile},
        )
        return Response(serializer.data)


class MockExamDetailView(APIView):
    """
    GET /api/v1/exams/catalog/<pk>/
    Returns a mock exam with all questions (for exam taking).
    Requires active subscription.
    """

    permission_classes = [IsSessionAuthenticated, IsSubscriber]

    def get(self, request, pk):
        try:
            exam = MockExam.objects.prefetch_related("questions").get(pk=pk, is_active=True)
        except MockExam.DoesNotExist:
            return Response({"detail": "Not found."}, status=404)
        return Response(MockExamDetailSerializer(exam).data)


# ─── Exam Attempt (Taking the exam) ──────────────────────────────────────────

class ExamAttemptStartView(APIView):
    """
    POST /api/v1/exams/catalog/<pk>/start/
    Start a new exam attempt.
    Requires active subscription.
    """

    permission_classes = [IsSessionAuthenticated, IsSubscriber]

    def post(self, request, pk):
        try:
            mock_exam = MockExam.objects.get(pk=pk, is_active=True)
        except MockExam.DoesNotExist:
            return Response({"detail": "Exam not found."}, status=404)
        
        # Check for existing in-progress attempt
        existing = ExamAttempt.objects.filter(
            user=request.user_profile,
            mock_exam=mock_exam,
            status="in_progress",
        ).first()
        
        if existing:
            return Response(ExamAttemptSerializer(existing).data)
        
        attempt = ExamAttempt.objects.create(
            user=request.user_profile,
            mock_exam=mock_exam,
            total_questions=mock_exam.questions.count(),
        )
        return Response(ExamAttemptSerializer(attempt).data, status=201)


class ExamAttemptAnswerView(APIView):
    """
    POST /api/v1/exams/attempts/<attempt_pk>/answer/
    Save or update an answer for a question.
    Expects: { question: int, selected_answer: str, is_marked: bool }
    Requires active subscription.
    """

    permission_classes = [IsSessionAuthenticated, IsSubscriber]

    def post(self, request, attempt_pk):
        try:
            attempt = ExamAttempt.objects.get(
                pk=attempt_pk,
                user=request.user_profile,
                status="in_progress",
            )
        except ExamAttempt.DoesNotExist:
            return Response({"detail": "Attempt not found or already completed."}, status=404)
        
        question_id = request.data.get("question")
        selected_answer = request.data.get("selected_answer", "")
        is_marked = request.data.get("is_marked", False)
        
        try:
            question = MockExamQuestion.objects.get(pk=question_id, mock_exam=attempt.mock_exam)
        except MockExamQuestion.DoesNotExist:
            return Response({"detail": "Question not found."}, status=404)
        
        is_correct = selected_answer.upper() == question.correct_answer.upper()
        
        answer, _ = ExamAnswer.objects.update_or_create(
            attempt=attempt,
            question=question,
            defaults={
                "selected_answer": selected_answer,
                "is_correct": is_correct,
                "is_marked": is_marked,
            },
        )
        
        return Response({
            "question": question_id,
            "selected_answer": selected_answer,
            "is_marked": is_marked,
            "saved": True,
        })


class ExamAttemptSubmitView(APIView):
    """
    POST /api/v1/exams/attempts/<attempt_pk>/submit/
    Submit the exam attempt, calculate score.
    Requires active subscription.
    """

    permission_classes = [IsSessionAuthenticated, IsSubscriber]

    def post(self, request, attempt_pk):
        try:
            attempt = ExamAttempt.objects.get(
                pk=attempt_pk,
                user=request.user_profile,
                status="in_progress",
            )
        except ExamAttempt.DoesNotExist:
            return Response({"detail": "Attempt not found or already completed."}, status=404)
        
        time_spent = request.data.get("time_spent_seconds", 0)
        
        total_correct = attempt.answers.filter(is_correct=True).count()
        total_questions = attempt.total_questions
        
        score = round((total_correct / max(total_questions, 1)) * 100, 1)
        
        attempt.status = "completed"
        attempt.score = score
        attempt.total_correct = total_correct
        attempt.time_spent_seconds = time_spent
        attempt.completed_at = timezone.now()
        attempt.save()

        # Update analytics records asynchronously-safe (in-process for now)
        try:
            from services.analytics.update_mastery import update_analytics_from_attempt  # noqa: PLC0415
            update_analytics_from_attempt(attempt)
        except Exception:
            import logging  # noqa: PLC0415
            logging.getLogger(__name__).exception("Analytics update failed for attempt %s", attempt.pk)

        return Response(ExamAttemptResultSerializer(attempt).data)


class ExamAttemptResultView(APIView):
    """
    GET /api/v1/exams/attempts/<attempt_pk>/results/
    Get detailed results including questions, answers, and performance by category.
    
    PREMIUM FEATURE: Requires active subscription
    """

    permission_classes = [IsSessionAuthenticated, IsSubscriber]

    def get(self, request, attempt_pk):
        try:
            attempt = ExamAttempt.objects.select_related("mock_exam").get(
                pk=attempt_pk,
                user=request.user_profile,
                status="completed",
            )
        except ExamAttempt.DoesNotExist:
            return Response({"detail": "Results not found."}, status=404)
        
        # Get all questions with answers
        questions = attempt.mock_exam.questions.all().order_by("order")
        answers = {a.question_id: a for a in attempt.answers.all()}
        
        question_results = []
        category_stats = {}
        
        for q in questions:
            answer = answers.get(q.id)
            q_data = MockExamQuestionWithAnswerSerializer(q).data
            q_data["user_answer"] = answer.selected_answer if answer else ""
            q_data["is_correct"] = answer.is_correct if answer else False
            q_data["is_marked"] = answer.is_marked if answer else False
            question_results.append(q_data)
            
            # Category stats
            cat = q.category or "General"
            if cat not in category_stats:
                category_stats[cat] = {"total": 0, "correct": 0}
            category_stats[cat]["total"] += 1
            if answer and answer.is_correct:
                category_stats[cat]["correct"] += 1
        
        # Build category performance
        categories = []
        for name, stats in category_stats.items():
            pct = round((stats["correct"] / max(stats["total"], 1)) * 100)
            categories.append({
                "name": name,
                "score": pct,
                "correct": stats["correct"],
                "total": stats["total"],
            })
        
        # Calculate percentile (simplified mock)
        all_scores = ExamAttempt.objects.filter(
            mock_exam=attempt.mock_exam,
            status="completed",
        ).values_list("score", flat=True)
        
        if all_scores:
            below = sum(1 for s in all_scores if s < attempt.score)
            percentile = round((below / len(all_scores)) * 100)
        else:
            percentile = 50
        
        return Response({
            "attempt": ExamAttemptResultSerializer(attempt).data,
            "questions": question_results,
            "categories": categories,
            "percentile": percentile,
            "incorrect_count": attempt.total_questions - attempt.total_correct,
        })
