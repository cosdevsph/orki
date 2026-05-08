from django.urls import path

from .views import DeckListView, FlashcardListView

urlpatterns = [
    path("flashcards/", FlashcardListView.as_view(), name="flashcard-list"),
    path("flashcards/decks/", DeckListView.as_view(), name="deck-list"),
]
