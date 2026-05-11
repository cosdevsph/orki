from django.urls import path

from .views import (
    AnalyticsOverviewView,
    DailyStreakView,
    StrongTopicsView,
    SubjectMasteryListView,
    WeakTopicsView,
)

urlpatterns = [
    path("analytics/", AnalyticsOverviewView.as_view(), name="analytics-overview"),
    path("analytics/mastery/", SubjectMasteryListView.as_view(), name="analytics-mastery"),
    path("analytics/weak-topics/", WeakTopicsView.as_view(), name="analytics-weak-topics"),
    path("analytics/strong-topics/", StrongTopicsView.as_view(), name="analytics-strong-topics"),
    path("analytics/streak/", DailyStreakView.as_view(), name="analytics-streak"),
]
