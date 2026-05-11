from django.urls import path

from .views import (
    BulkCreateFlashcardsView,
    DeckDetailView,
    DeckListView,
    FlashcardListView,
    FlashcardReviewView,
    SubjectDecksView,
)

urlpatterns = [
    path("flashcards/", FlashcardListView.as_view(), name="flashcard-list"),
    path("flashcards/<int:pk>/review/", FlashcardReviewView.as_view(), name="flashcard-review"),
    path("flashcards/decks/", DeckListView.as_view(), name="deck-list"),
    path("flashcards/decks/<int:pk>/cards/", DeckDetailView.as_view(), name="deck-add-card"),
    path("flashcards/bulk-create/", BulkCreateFlashcardsView.as_view(), name="flashcard-bulk-create"),
    path("flashcards/subject-decks/", SubjectDecksView.as_view(), name="flashcard-subject-decks"),
]
