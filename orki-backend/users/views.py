from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
import logging

from core.permissions import IsSessionAuthenticated
from core.throttling import AuthRateThrottle
from services.firebase.verify_token import FirebaseTokenError, verify_firebase_token
from services.paymongo import PayMongoService, PayMongoError, WebhookVerificationError, WebhookHandler

from .models import UserProfile, Subscription
from .serializers import LoginSerializer, OnboardingSerializer, UserProfileSerializer, SubscriptionSerializer, CheckoutResponseSerializer

logger = logging.getLogger(__name__)


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
        # exam_type and onboarding_completed are permanently set during onboarding
        immutable_fields = {"exam_type", "onboarding_completed"}
        mutable_data = {k: v for k, v in request.data.items() if k not in immutable_fields}
        serializer = UserProfileSerializer(
            request.user_profile, data=mutable_data, partial=True
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
        if request.user_profile.onboarding_completed:
            return Response(
                {"detail": "Onboarding already completed. Exam type cannot be changed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

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
        profile.exam_date = data.get("exam_date")
        profile.onboarding_completed = True
        profile.save(
            update_fields=[
                "first_name",
                "last_name",
                "age",
                "exam_type",
                "exam_date",
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


# ─── Subscription & Payments ──────────────────────────────────────────────────

class SubscriptionStatusView(APIView):
    """
    GET /api/v1/users/subscription/
    ==============================
    Returns detailed subscription status for the authenticated user.
    Frontend uses this to determine UI state (lock/unlock exams & flashcards).
    
    Response:
    {
        "status": "active|no_subscription|expired|cancelled",
        "is_active": true/false,
        "plan": "Orki Basic ₱49",
        "payment_methods_allowed": ["GCash", "Maya", "Card", "QRPh"],
        "expires_at": "2026-06-14T10:30:00Z",
        "days_remaining": 30
    }
    """
    permission_classes = [IsSessionAuthenticated]

    def get(self, request):
        subscription, _ = Subscription.objects.get_or_create(user=request.user_profile)
        
        # Calculate days remaining
        days_remaining = None
        if subscription.expiry_date:
            delta = subscription.expiry_date - timezone.now()
            days_remaining = max(0, delta.days)
        
        response_data = {
            "status": subscription.status,
            "is_active": subscription.is_active,
            "plan": subscription.plan_name,
            "payment_methods_allowed": ["GCash", "Maya", "Card", "QRPh"],
            "expires_at": subscription.expiry_date.isoformat() if subscription.expiry_date else None,
            "days_remaining": days_remaining,
            "payment_method": subscription.payment_method if subscription.payment_method != "unknown" else None,
        }
        
        return Response(response_data, status=status.HTTP_200_OK)


class CreateCheckoutView(APIView):
    """
    POST /api/v1/payments/checkout/
    ===============================
    Create a PayMongo checkout session for subscription payment.
    
    Supports payment methods: GCash, Maya, Card, QRPh
    
    Request:
    {
        "payment_methods": ["gcash", "paymaya", "card", "qrph"]  # optional
    }
    
    Response:
    {
        "checkout_url": "https://checkout.paymongo.com/...",
        "reference_id": "cs_xxxxxxx"
    }
    
    Frontend redirects user to checkout_url. After payment, PayMongo
    redirects back and webhook confirms payment.
    """
    permission_classes = [IsSessionAuthenticated]

    def post(self, request):
        user_profile = request.user_profile
        
        try:
            # Get or create subscription
            subscription, created = Subscription.objects.get_or_create(user=user_profile)
            
            if created:
                logger.info(f"✓ Created new subscription for user {user_profile.id}")
            
            # Check if already active subscriber
            if subscription.is_active:
                logger.warning(f"⚠ User {user_profile.id} attempted checkout while already subscribed")
                return Response(
                    {"detail": "You already have an active subscription."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            # Get payment methods from request (optional)
            payment_methods = request.data.get("payment_methods")
            
            logger.info(f"📲 Creating checkout for user {user_profile.id} ({user_profile.email})")
            
            # Create PayMongo checkout
            checkout = PayMongoService.create_checkout(
                user_id=user_profile.id,
                user_email=user_profile.email,
                payment_methods=payment_methods,
            )
            
            # Store checkout reference in subscription
            subscription.paymongo_checkout_id = checkout["reference_id"]
            subscription.save(update_fields=["paymongo_checkout_id", "updated_at"])
            
            logger.info(f"✓ Checkout created: {checkout['reference_id']}")
            
            response = CheckoutResponseSerializer(checkout)
            return Response(response.data, status=status.HTTP_200_OK)

        except PayMongoError as e:
            logger.error(f"✗ PayMongo error: {str(e)}")
            return Response(
                {"detail": f"Payment service error: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            logger.error(f"✗ Unexpected error: {str(e)}")
            return Response(
                {"detail": "Failed to create checkout session"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


@method_decorator(csrf_exempt, name="dispatch")
class PayMongoWebhookView(APIView):
    """
    POST /api/v1/payments/webhook/
    ==============================
    CRITICAL: PayMongo webhook endpoint for payment confirmation.
    
    This is the ONLY source of truth for payment confirmation.
    
    Security:
    - Verifies webhook signature (HMAC-SHA256)
    - Prevents duplicate processing (idempotency check)
    - Updates subscription to ACTIVE when payment confirmed
    
    PayMongo will POST webhook events here.
    Required header: X-Paymongo-Signature
    
    Only processes: checkout_session.payment.paid
    """
    permission_classes = [AllowAny]  # Webhook must be accessible without auth

    def post(self, request):
        """Handle PayMongo webhook event."""
        request_body = request.body
        
        if not request_body:
            logger.error("Empty webhook request body")
            return Response(
                {"error": "Empty request body"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        try:
            # Process webhook
            result = WebhookHandler.process_webhook(request_body, "")
            logger.info(f"Webhook processed successfully: {result['message']}")
            
            return Response(
                result,
                status=status.HTTP_200_OK,
            )
        
        except WebhookVerificationError as e:
            logger.error(f"Webhook verification failed: {str(e)}")
            return Response(
                {"error": "Webhook verification failed"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        
        except Exception as e:
            logger.error(f"Webhook processing error: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Webhook processing error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
