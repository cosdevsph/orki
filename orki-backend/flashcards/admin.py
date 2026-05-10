from django.contrib import admin

from .models import Deck, Flashcard


@admin.register(Deck)
class DeckAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "created_at")
    search_fields = ("name", "user__email")


@admin.register(Flashcard)
class FlashcardAdmin(admin.ModelAdmin):
    list_display = ("front", "deck", "next_review", "interval", "ease_factor")
    list_filter = ("deck",)
    search_fields = ("front", "back")
