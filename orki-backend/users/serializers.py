from typing import Optional
from rest_framework import serializers

from .models import UserProfile, Subscription


class UserProfileSerializer(serializers.ModelSerializer):
    professional_title = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "email",
            "display_name",
            "first_name",
            "last_name",
            "age",
            "exam_type",
            "exam_date",
            "onboarding_completed",
            "professional_title",
        ]
        read_only_fields = ["id", "email"]

    def get_professional_title(self, obj) -> str:
        return obj.professional_title


class LoginSerializer(serializers.Serializer):
    """Accepts the Firebase ID token produced by the client-side SDK."""

    id_token = serializers.CharField(
        write_only=True,
        help_text="Firebase ID token from the client-side sign-in.",
    )


class OnboardingSerializer(serializers.Serializer):
    """Validates the onboarding profile payload."""

    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    age = serializers.IntegerField(min_value=1, max_value=120)
    exam_type = serializers.ChoiceField(choices=["LEPT", "CSE", "PmLE", "CLE"])
    exam_date = serializers.DateField(required=False, allow_null=True)


class SubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for subscription status (frontend-facing)."""
    
    days_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = Subscription
        fields = [
            "status",
            "is_active",
            "plan_name",
            "amount_php",
            "currency",
            "payment_method",
            "start_date",
            "expiry_date",
            "days_remaining",
            "payment_confirmed_at",
        ]
        read_only_fields = fields  # All fields are read-only
    
    def get_days_remaining(self, obj) -> Optional[int]:
        """Calculate days remaining until expiry."""
        if not obj.expiry_date:
            return None
        from django.utils import timezone
        delta = obj.expiry_date - timezone.now()
        return max(0, delta.days)


class CheckoutResponseSerializer(serializers.Serializer):
    """Response serializer for checkout session."""
    checkout_url = serializers.URLField()
    reference_id = serializers.CharField()
