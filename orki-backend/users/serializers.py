from rest_framework import serializers

from .models import UserProfile


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
        max_length=4096,
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
