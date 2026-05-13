"""
firestore.py — Firestore client singleton.

Provides a lazily-initialised Firestore client that reuses the single
Firebase Admin app.  Import ``get_firestore_client`` wherever you need
to read from or write to Firestore.

Usage::

    from services.firebase.firestore import get_firestore_client

    db = get_firestore_client()
    doc = db.collection("questions").document("ENG-001").get()
"""
from __future__ import annotations

import firebase_admin
from firebase_admin import firestore

from .firebase_admin import get_firebase_app

_client = None


def get_firestore_client():
    """
    Return an authenticated Firestore client (initialised once).

    Ensures firebase_admin.initialize_app() has been called before
    constructing the client, following the recommended pattern::

        firebase_admin.initialize_app(cred)
        db = firestore.client()
    """
    global _client
    if _client is not None:
        return _client

    # Guarantee the Admin app is initialised before building the client
    app = get_firebase_app()
    if app is None:
        raise RuntimeError(
            "Firebase Admin app failed to initialise. "
            "Check FIREBASE_CREDENTIALS_PATH and FIREBASE_PROJECT_ID in your .env."
        )

    _client = firestore.client(app=app)
    if _client is None:
        raise RuntimeError(
            "firestore.client() returned None — ensure the service account belongs "
            "to the correct Firebase project and Firestore is enabled."
        )
    return _client
