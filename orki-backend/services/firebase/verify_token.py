from firebase_admin import auth

from .firebase_admin import get_firebase_app


class FirebaseTokenError(Exception):
    """Raised when a Firebase ID token cannot be verified."""


def verify_firebase_token(id_token: str) -> dict:
    """
    Verify a Firebase ID token and return its decoded claims.

    Raises FirebaseTokenError if the token is invalid or expired.
    """
    try:
        get_firebase_app()
        return auth.verify_id_token(id_token)
    except auth.ExpiredIdTokenError:
        raise FirebaseTokenError("Token has expired. Please sign in again.")
    except auth.RevokedIdTokenError:
        raise FirebaseTokenError("Token has been revoked. Please sign in again.")
    except auth.InvalidIdTokenError:
        raise FirebaseTokenError("Invalid authentication token.")
    except Exception as exc:
        raise FirebaseTokenError(f"Token verification failed: {exc}") from exc
