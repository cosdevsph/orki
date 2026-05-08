from django.db import models

from users.models import UserProfile


class Deck(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="decks")
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "flashcard_decks"
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} ({self.user.email})"


class Flashcard(models.Model):
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name="flashcards")
    front = models.TextField()
    back = models.TextField()
    is_due = models.BooleanField(default=True)
    next_review = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "flashcards"

    def __str__(self) -> str:
        return f"{self.front[:60]}… ({'due' if self.is_due else 'reviewed'})"
