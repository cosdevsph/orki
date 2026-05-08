from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsSessionAuthenticated
from core.throttling import AuthRateThrottle
from services.firebase.verify_token import FirebaseTokenError, verify_firebase_token

from .models import UserProfile
from .serializers import LoginSerializer, OnboardingSerializer, UserProfileSerializer


# ─── CSRF Primer ──────────────────────────────────────────────────────────────

@method_decorator(ensure_csrf_cookie, name="dispatch")
class CSRFView(APIView):
    """
    GET /api/v1/csrf/
    Sets the CSRF cookie so the frontend can include X-CSRFToken in mutations.
    No authentication required — call this on app boot.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"detail": "CSRF cookie set."})


# ─── Authentication ───────────────────────────────────────────────────────────

@method_decorator(csrf_exempt, name="dispatch")
class LoginView(APIView):
    """
    POST /api/v1/auth/login/
    Accepts a Firebase ID token, verifies it with Firebase Admin SDK,
    creates (or retrieves) the user profile, and opens a secure server session.
    """

    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        id_token: str = serializer.validated_data["id_token"]

        try:
            decoded = verify_firebase_token(id_token)
        except FirebaseTokenError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_401_UNAUTHORIZED)

        firebase_uid: str = decoded["uid"]
        email: str = decoded.get("email", "")
        display_name: str = decoded.get("name", "")

        profile, _ = UserProfile.objects.get_or_create(
            firebase_uid=firebase_uid,
            defaults={"email": email, "display_name": display_name},
        )

        # Persist session server-side (HttpOnly cookie sent automatically)
        request.session["firebase_uid"] = firebase_uid
        request.session["user_id"] = profile.id
        request.session.set_expiry(60 * 60 * 24 * 7)  # 7 days

        return Response(
            {
                "user": UserProfileSerializer(profile).data,
                "onboarding_complete": profile.onboarding_completed,
            },
            status=status.HTTP_200_OK,
        )


@method_decorator(csrf_exempt, name="dispatch")
class LogoutView(APIView):
    """
    POST /api/v1/auth/logout/
    Flushes the server session.  Safe to call even when not authenticated.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        request.session.flush()
        return Response({"detail": "Logged out successfully."}, status=status.HTTP_200_OK)


class SessionView(APIView):
    """
    GET /api/v1/auth/session/
    Returns the current authenticated user.  401 if no valid session exists.
    """

    permission_classes = [IsSessionAuthenticated]

    def get(self, request):
        return Response(
            {
                "user": UserProfileSerializer(request.user_profile).data,
                "onboarding_complete": request.user_profile.onboarding_completed,
            }
        )


# ─── Profile ──────────────────────────────────────────────────────────────────

class ProfileView(APIView):
    """
    GET  /api/v1/users/me/   — Return the authenticated user's profile.
    PATCH /api/v1/users/me/  — Partially update the profile.
    """

    permission_classes = [IsSessionAuthenticated]

    def get(self, request):
        return Response(UserProfileSerializer(request.user_profile).data)

    def patch(self, request):
        serializer = UserProfileSerializer(
            request.user_profile, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# ─── Onboarding ───────────────────────────────────────────────────────────────

class OnboardingView(APIView):
    """
    GET  /api/v1/users/onboarding/ — Return onboarding completion status.
    POST /api/v1/users/onboarding/ — Save onboarding profile and mark complete.
    """

    permission_classes = [IsSessionAuthenticated]

    def get(self, request):
        return Response(
            {"onboarding_completed": request.user_profile.onboarding_completed}
        )

    def post(self, request):
        # ── Temporary session diagnostics (remove before production) ──
        import logging
        logger = logging.getLogger(__name__)
        logger.debug(
            "[OnboardingView] session_key=%s firebase_uid=%s user_profile=%s",
            request.session.session_key,
            request.session.get("firebase_uid"),
            getattr(request, "user_profile", "MISSING"),
        )
        # ─────────────────────────────────────────────────────────────

        serializer = OnboardingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        profile = request.user_profile
        profile.first_name = data["first_name"]
        profile.last_name = data["last_name"]
        profile.age = data["age"]
        profile.exam_type = data["exam_type"]
        profile.onboarding_completed = True
        profile.save(
            update_fields=[
                "first_name",
                "last_name",
                "age",
                "exam_type",
                "onboarding_completed",
                "updated_at",
            ]
        )

        return Response(
            {
                "detail": "Onboarding complete.",
                "user": UserProfileSerializer(profile).data,
            },
            status=status.HTTP_200_OK,
        )
