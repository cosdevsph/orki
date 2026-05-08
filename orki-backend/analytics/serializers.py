from rest_framework import serializers

from .models import AnalyticsPoint


class AnalyticsPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsPoint
        fields = ["label", "score"]
