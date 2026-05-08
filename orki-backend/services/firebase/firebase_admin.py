import os
import firebase_admin
from firebase_admin import credentials
from django.conf import settings

_app: firebase_admin.App | None = None


def get_firebase_app() -> firebase_admin.App:
    """Initialise (once) and return the Firebase Admin app."""
    global _app
    if _app is not None:
        return _app

    cred_path = getattr(settings, "FIREBASE_CREDENTIALS_PATH", None)

    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
    else:
        # Fallback: Application Default Credentials (Cloud environments / CI)
        cred = credentials.ApplicationDefault()

    _app = firebase_admin.initialize_app(cred)
    return _app
