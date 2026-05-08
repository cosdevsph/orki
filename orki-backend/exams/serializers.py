from rest_framework import serializers

from .models import Exam


class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = ["id", "title", "scheduled_at", "duration_minutes", "status", "score"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user_profile
        return super().create(validated_data)
