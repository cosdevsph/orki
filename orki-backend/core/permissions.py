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
