from django.db import models
from django.utils import timezone

from users.models import UserProfile


class Deck(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="decks")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "flashcard_decks"
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} ({self.user.email})"


class Flashcard(models.Model):
    """
    A single flashcard with Anki-style Spaced Repetition System (SRS) fields.
    
    The SRS algorithm (SM-2 variant) tracks:
    - interval: days until next review
    - ease_factor: multiplier for interval growth (default 2.5)
    - repetitions: consecutive correct recalls
    - next_review: the exact datetime the card is due
    """

    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name="flashcards")
    front = models.TextField()
    back = models.TextField()
    
    # SRS fields
    interval = models.PositiveIntegerField(default=0, help_text="Days until next review")
    ease_factor = models.FloatField(default=2.5, help_text="Ease factor (EF), min 1.3")
    repetitions = models.PositiveIntegerField(default=0, help_text="Consecutive correct recalls")
    next_review = models.DateTimeField(default=timezone.now, help_text="When this card is due for review")
    last_reviewed = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "flashcards"

    @property
    def is_due(self) -> bool:
        """Card is due if next_review is in the past or now."""
        return self.next_review <= timezone.now()

    def review(self, quality: int) -> None:
        """
        Apply the SM-2 spaced repetition algorithm.
        
        quality: 0=Again, 1=Hard, 2=Good, 3=Easy
        """
        now = timezone.now()
        self.last_reviewed = now
        
        if quality == 0:  # Again
            self.repetitions = 0
            self.interval = 1  # Review again in 1 minute (treated as 1 day for simplicity)
            # Decrease ease factor
            self.ease_factor = max(1.3, self.ease_factor - 0.2)
        elif quality == 1:  # Hard
            if self.repetitions == 0:
                self.interval = 1
            else:
                self.interval = max(1, int(self.interval * 1.2))
            self.repetitions += 1
            self.ease_factor = max(1.3, self.ease_factor - 0.15)
        elif quality == 2:  # Good
            if self.repetitions == 0:
                self.interval = 1
            elif self.repetitions == 1:
                self.interval = 6
            else:
                self.interval = int(self.interval * self.ease_factor)
            self.repetitions += 1
        elif quality == 3:  # Easy
            if self.repetitions == 0:
                self.interval = 4
            elif self.repetitions == 1:
                self.interval = 10
            else:
                self.interval = int(self.interval * self.ease_factor * 1.3)
            self.repetitions += 1
            self.ease_factor = max(1.3, self.ease_factor + 0.15)
        
        from datetime import timedelta
        self.next_review = now + timedelta(days=self.interval)
        self.save()

    def __str__(self) -> str:
        return f"{self.front[:60]}… ({'due' if self.is_due else 'reviewed'})"
