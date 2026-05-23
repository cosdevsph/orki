"""
core/authentication.py — Stateless Firebase ID-token authentication.

Every API request must carry:
    Authorization: Bearer <firebase-id-token>

The token is verified with the Firebase Admin SDK on each request.
No Django sessions, no database lookups, no CSRF cookies.
Data survives deployments because nothing is stored in Django's database.
"""
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from services.firebase.firebase_admin import get_firebase_app


class FirebaseUser:
    """
    Minimal principal attached to ``request.user`` after token verification.
    Mimics the subset of Django's AbstractUser API that DRF permission classes
    and our views depend on.
    """

    is_authenticated = True
    is_anonymous = False

    def __init__(self, uid: str, email: str = "", display_name: str = ""):
        self.uid = uid
        self.email = email
        self.display_name = display_name

    # DRF throttling (UserRateThrottle) and other DRF internals call .pk
    # to identify the user.  Return the Firebase UID as the unique key.
    @property
    def pk(self) -> str:
        return self.uid

    def __str__(self) -> str:  # pragma: no cover
        return self.uid


class FirebaseAuthentication(BaseAuthentication):
    """
    DRF authentication backend: validates a Firebase ID token from the
    ``Authorization: Bearer <token>`` request header.

    Sets:
        request.user          → FirebaseUser(uid, email, display_name)
        request.firebase_uid  → str  (the UID, for convenience)

    Returns None (defers to the next class) if the header is absent so that
    AllowAny views (e.g. the PayMongo webhook) still work without a token.
    """

    keyword = "Bearer"

    def authenticate(self, request):
        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return None  # No token — let DRF fall through to permission check

        id_token = header[7:].strip()
        if not id_token:
            return None

        try:
            from firebase_admin import auth as firebase_auth
            get_firebase_app()
            decoded = firebase_auth.verify_id_token(id_token)
        except Exception as exc:
            raise AuthenticationFailed(
                f"Invalid or expired Firebase token: {exc}"
            ) from exc

        uid: str = decoded.get("uid", "")
        if not uid:
            raise AuthenticationFailed("Firebase token is missing the uid claim.")

        firebase_user = FirebaseUser(
            uid=uid,
            email=decoded.get("email", ""),
            display_name=decoded.get("name", ""),
        )

        # Expose uid directly on request for quick access in views
        request.firebase_uid = uid

        # Populate request.user_profile with the SQLite UserProfile row so
        # that every view can use it without doing its own lookup.  This
        # overrides the None set by FirestoreUserMiddleware.
        # get_or_create ensures Firebase-only users (who have never had a row
        # created in Django's DB) get a minimal row on their first request,
        # which prevents AttributeError crashes in any view that uses the
        # profile as a FK.
        try:
            from users.models import UserProfile
            request.user_profile, created = UserProfile.objects.get_or_create(
                firebase_uid=uid,
                defaults={
                    "email": decoded.get("email", ""),
                    "display_name": decoded.get("name", ""),
                },
            )
            # On first creation, sync exam_type (and other fields) from the
            # Firestore profile so the new row is accurate from the start.
            if created:
                try:
                    from services.firebase.firestore import get_user_profile
                    fs_profile = get_user_profile(uid) or {}
                    update_fields = []
                    if fs_profile.get("exam_type"):
                        request.user_profile.exam_type = fs_profile["exam_type"]
                        update_fields.append("exam_type")
                    if fs_profile.get("first_name"):
                        request.user_profile.first_name = fs_profile["first_name"]
                        update_fields.append("first_name")
                    if fs_profile.get("last_name"):
                        request.user_profile.last_name = fs_profile["last_name"]
                        update_fields.append("last_name")
                    if fs_profile.get("age"):
                        request.user_profile.age = fs_profile["age"]
                        update_fields.append("age")
                    if fs_profile.get("onboarding_completed"):
                        request.user_profile.onboarding_completed = fs_profile["onboarding_completed"]
                        update_fields.append("onboarding_completed")
                    if update_fields:
                        request.user_profile.save(update_fields=update_fields)
                except Exception:
                    pass  # Firestore sync failure is non-fatal; row already exists
        except Exception:
            # DB unavailable or unexpected error — leave as None; views handle it.
            request.user_profile = None

        return (firebase_user, None)

    def authenticate_header(self, request) -> str:
        return self.keyword
