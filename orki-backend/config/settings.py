"""
Orki Backend — Django Settings
================================
Environment variables are loaded from the `.env` file in BASE_DIR.
Never commit real secrets.  See `.env.example` for required keys.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

# ─── Paths ────────────────────────────────────────────────────────────────────

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# ─── Core ─────────────────────────────────────────────────────────────────────

SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    "django-insecure-CHANGE-ME-before-production",
)

DEBUG = os.environ.get("DJANGO_DEBUG", "True") == "True"

# Bulletproof ALLOWED_HOSTS: strip accidental http/https prefixes and force core domains
_env_hosts = os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
ALLOWED_HOSTS = [h.replace("http://", "").replace("https://", "").strip() for h in _env_hosts if h]
ALLOWED_HOSTS.extend([".onrender.com", "orki.cosedevs.com", "localhost", "127.0.0.1"])
ALLOWED_HOSTS = list(set(ALLOWED_HOSTS))

# Trust Render's load balancer to tell us if the request was HTTPS
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# ─── Applications ─────────────────────────────────────────────────────────────

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "rest_framework",
    "corsheaders",
    # Local apps
    "users",
    "dashboard",
    "analytics",
    "exams",
    "flashcards",
    "common",
]

# ─── Middleware ────────────────────────────────────────────────────────────────

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",            # Must be first
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",       # Static files on Render
    "django.contrib.sessions.middleware.SessionMiddleware",  # Required by Django admin
    "django.middleware.common.CommonMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",  # Required by Django admin
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "core.middleware.FirestoreUserMiddleware",          # Initialises request.user_profile
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# ─── Database ─────────────────────────────────────────────────────────────────

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ─── Password Validation ──────────────────────────────────────────────────────

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ─── Internationalisation ─────────────────────────────────────────────────────

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ─── Static Files ─────────────────────────────────────────────────────────────

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# ─── Django REST Framework ────────────────────────────────────────────────────

REST_FRAMEWORK = {
    # Stateless Firebase ID-token auth — no session DB required.
    # Every request must include: Authorization: Bearer <firebase-id-token>
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "core.authentication.FirebaseAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "core.permissions.IsFirebaseAuthenticated",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "60/minute",
        "user": "300/minute",
        "auth": "10/minute",        # used by AuthRateThrottle
    },
    "EXCEPTION_HANDLER": "core.exceptions.custom_exception_handler",
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
}

# ─── CORS ─────────────────────────────────────────────────────────────────────

_FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

_CORS_ORIGINS = list({
    _FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://orki.cosedevs.com",
})

CORS_ALLOWED_ORIGINS = _CORS_ORIGINS
# credentials: "include" is no longer needed (no cookies), but harmless to keep
CORS_ALLOW_CREDENTIALS = False
CORS_ALLOW_HEADERS = [
    "accept",
    "authorization",
    "content-type",
    "origin",
    "x-requested-with",
]

# ─── Security Headers ─────────────────────────────────────────────────────────

SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = "DENY"

if not DEBUG:
    SECURE_HSTS_SECONDS = 31_536_000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_SSL_REDIRECT = True

# ─── Firebase Admin SDK ───────────────────────────────────────────────────────
# Point FIREBASE_CREDENTIALS_PATH at your service account JSON file.
# In production, prefer using Application Default Credentials instead.

FIREBASE_CREDENTIALS_PATH = os.environ.get("FIREBASE_CREDENTIALS_PATH")
FIREBASE_PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID")

# ─── Email ─────────────────────────────────────────────────────────────────────
# Defaults to console backend in development so no real emails are sent.
# Set EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend in production.

EMAIL_BACKEND = os.environ.get(
    "EMAIL_BACKEND",
    "django.core.mail.backends.console.EmailBackend",
)
EMAIL_HOST = os.environ.get("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587"))
EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "True") == "True"
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "Orki <noreply@orki.cosedevs.com>")

# Public URL used in email CTAs (e.g. the "Study with Orki Now" button)
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
