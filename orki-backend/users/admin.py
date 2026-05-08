from django.contrib import admin

from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("display_name", "email", "exam_type", "onboarding_completed", "created_at")
    list_filter = ("exam_type", "onboarding_completed")
    search_fields = ("email", "display_name", "firebase_uid")
    readonly_fields = ("firebase_uid", "created_at", "updated_at")
