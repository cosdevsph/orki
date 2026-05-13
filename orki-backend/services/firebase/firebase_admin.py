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
    project_id = getattr(settings, "FIREBASE_PROJECT_ID", None)

    # Resolve relative credential paths against BASE_DIR
    if cred_path and not os.path.isabs(cred_path):
        cred_path = os.path.join(settings.BASE_DIR, cred_path)

    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
    else:
        # Fallback: Application Default Credentials (Cloud environments / CI)
        cred = credentials.ApplicationDefault()

    options = {"projectId": project_id} if project_id else {}
    _app = firebase_admin.initialize_app(cred, options)
    return _app
