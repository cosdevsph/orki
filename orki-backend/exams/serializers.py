from rest_framework import serializers

from .models import Exam, ExamAnswer, ExamAttempt, MockExam, MockExamQuestion


class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = ["id", "title", "scheduled_at", "duration_minutes", "status", "score"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user_profile
        return super().create(validated_data)


class MockExamQuestionSerializer(serializers.ModelSerializer):
    """Serializer for questions — excludes correct_answer during exam taking."""

    class Meta:
        model = MockExamQuestion
        fields = [
            "id", "question_text", "question_type", "category",
            "option_a", "option_b", "option_c", "option_d", "order",
        ]


class MockExamQuestionWithAnswerSerializer(serializers.ModelSerializer):
    """Full question serializer including correct answer — for results review."""

    class Meta:
        model = MockExamQuestion
        fields = [
            "id", "question_text", "question_type", "category",
            "option_a", "option_b", "option_c", "option_d",
            "correct_answer", "explanation", "order",
        ]


class MockExamListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for catalog listing."""
    category_display = serializers.CharField(source="get_category_display", read_only=True)
    difficulty_display = serializers.CharField(source="get_difficulty_display", read_only=True)
    last_score = serializers.SerializerMethodField()

    class Meta:
        model = MockExam
        fields = [
            "id", "title", "description", "category", "category_display",
            "subject", "difficulty", "difficulty_display",
            "question_count", "duration_minutes", "last_score",
        ]

    def get_last_score(self, obj):
        user = self.context.get("user_profile")
        if not user:
            return None
        attempt = obj.attempts.filter(user=user, status="completed").order_by("-completed_at").first()
        return attempt.score if attempt else None


class MockExamDetailSerializer(serializers.ModelSerializer):
    """Full serializer with questions for exam taking."""
    questions = MockExamQuestionSerializer(many=True, read_only=True)
    category_display = serializers.CharField(source="get_category_display", read_only=True)

    class Meta:
        model = MockExam
        fields = [
            "id", "title", "description", "category", "category_display",
            "subject", "difficulty", "question_count", "duration_minutes",
            "questions",
        ]


class ExamAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamAnswer
        fields = ["question", "selected_answer", "is_marked"]


class ExamAttemptSerializer(serializers.ModelSerializer):
    mock_exam_title = serializers.CharField(source="mock_exam.title", read_only=True)
    answers = ExamAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = ExamAttempt
        fields = [
            "id", "mock_exam", "mock_exam_title", "status",
            "score", "total_correct", "total_questions",
            "time_spent_seconds", "started_at", "completed_at", "answers",
        ]
        read_only_fields = ["id", "status", "score", "total_correct", "total_questions"]


class ExamAttemptResultSerializer(serializers.ModelSerializer):
    """Results serializer with full question+answer details for review."""
    mock_exam_title = serializers.CharField(source="mock_exam.title", read_only=True)
    mock_exam_category = serializers.CharField(source="mock_exam.get_category_display", read_only=True)

    class Meta:
        model = ExamAttempt
        fields = [
            "id", "mock_exam", "mock_exam_title", "mock_exam_category",
            "status", "score", "total_correct", "total_questions",
            "time_spent_seconds", "started_at", "completed_at",
        ]
