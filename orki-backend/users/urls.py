from django.urls import path

from .views import CSRFView, LoginView, LogoutView, OnboardingView, ProfileView, SessionView

urlpatterns = [
    path("csrf/", CSRFView.as_view(), name="csrf"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("auth/session/", SessionView.as_view(), name="auth-session"),
    path("users/me/", ProfileView.as_view(), name="user-profile"),
    path("users/onboarding/", OnboardingView.as_view(), name="user-onboarding"),
]
