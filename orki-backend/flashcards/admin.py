from django.contrib import admin

from .models import Deck, Flashcard


@admin.register(Deck)
class DeckAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "created_at")
    search_fields = ("name", "user__email")


@admin.register(Flashcard)
class FlashcardAdmin(admin.ModelAdmin):
    list_display = ("front", "deck", "is_due", "next_review")
    list_filter = ("is_due",)
    search_fields = ("front", "back")
