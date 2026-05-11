from rest_framework import serializers

from .models import AnalyticsPoint, DailyStreak, SubjectMastery, TopicAccuracy


class AnalyticsPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsPoint
        fields = ["label", "score", "recorded_at"]


class SubjectMasterySerializer(serializers.ModelSerializer):
    weak_topics = serializers.SerializerMethodField()
    strong_topics = serializers.SerializerMethodField()

    class Meta:
        model = SubjectMastery
        fields = [
            "subject", "exam_type", "mastery_percentage",
            "total_questions_attempted", "total_questions_correct",
            "weak_topics", "strong_topics", "last_updated",
        ]

    def get_weak_topics(self, obj):
        qs = TopicAccuracy.objects.filter(
            user=obj.user, exam_type=obj.exam_type, subject=obj.subject,
            total_count__gte=3, accuracy_percentage__lt=60.0,
        ).values_list("topic", flat=True)
        return list(qs)

    def get_strong_topics(self, obj):
        qs = TopicAccuracy.objects.filter(
            user=obj.user, exam_type=obj.exam_type, subject=obj.subject,
            total_count__gte=3, accuracy_percentage__gte=80.0,
        ).values_list("topic", flat=True)
        return list(qs)


class TopicAccuracySerializer(serializers.ModelSerializer):
    is_weak = serializers.BooleanField(read_only=True)
    is_strong = serializers.BooleanField(read_only=True)

    class Meta:
        model = TopicAccuracy
        fields = [
            "subject", "topic", "correct_count", "total_count",
            "accuracy_percentage", "is_weak", "is_strong", "last_updated",
        ]


class DailyStreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyStreak
        fields = ["current_streak", "longest_streak", "last_active_date", "updated_at"]
