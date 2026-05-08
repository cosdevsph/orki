from django.urls import include, path

urlpatterns = [
    path("", include("users.urls")),
    path("", include("dashboard.urls")),
    path("", include("analytics.urls")),
    path("", include("exams.urls")),
    path("", include("flashcards.urls")),
]
