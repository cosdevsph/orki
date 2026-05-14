from rest_framework.permissions import BasePermission


class IsSessionAuthenticated(BasePermission):
    """
    Grants access only when the request carries a valid server-side session
    that was created by our Firebase token-verification login endpoint.
    """

    message = "Authentication credentials were not provided or have expired."

    def has_permission(self, request, view) -> bool:
        return bool(
            request.session.get("firebase_uid")
            and getattr(request, "user_profile", None) is not None
        )


class IsSubscriber(BasePermission):
    """
    Grants access only to users with active subscription.
    
    BACKEND ENFORCED: Frontend lock UI is not enough.
    Exam + Flashcard endpoints must require this permission.
    """

    message = "Premium access required. Please upgrade your subscription to access exams & flashcards."

    def has_permission(self, request, view) -> bool:
        """Check if user has active subscription."""
        if not getattr(request, "user_profile", None):
            return False
        
        try:
            subscription = request.user_profile.subscription
            # is_active checks: status == "active" AND not expired
            return subscription.is_active
        except Exception:
            return False
