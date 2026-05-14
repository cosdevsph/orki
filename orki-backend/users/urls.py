from django.urls import path

from .views import (
    CSRFView,
    CreateCheckoutView,
    LoginView,
    LogoutView,
    OnboardingView,
    PayMongoWebhookView,
    ProfileView,
    SessionView,
    SubscriptionStatusView,
)

urlpatterns = [
    path("csrf/", CSRFView.as_view(), name="csrf"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("auth/session/", SessionView.as_view(), name="auth-session"),
    path("users/me/", ProfileView.as_view(), name="user-profile"),
    path("users/onboarding/", OnboardingView.as_view(), name="user-onboarding"),
    path("users/subscription/", SubscriptionStatusView.as_view(), name="subscription-status"),
    path("payments/checkout/", CreateCheckoutView.as_view(), name="create-checkout"),
    path("payments/webhook/", PayMongoWebhookView.as_view(), name="paymongo-webhook"),
]
