from django.contrib import admin

from .models import AnalyticsPoint


@admin.register(AnalyticsPoint)
class AnalyticsPointAdmin(admin.ModelAdmin):
    list_display = ("label", "score", "user", "recorded_at")
    search_fields = ("user__email",)
