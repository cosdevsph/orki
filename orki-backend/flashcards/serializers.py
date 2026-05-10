from rest_framework import serializers

from .models import Deck, Flashcard


class FlashcardSerializer(serializers.ModelSerializer):
    deck = serializers.CharField(source="deck.name", read_only=True)
    is_due = serializers.BooleanField(read_only=True)

    class Meta:
        model = Flashcard
        fields = [
            "id", "front", "back", "deck", "is_due",
            "interval", "ease_factor", "repetitions", "next_review",
        ]
        read_only_fields = ["id", "interval", "ease_factor", "repetitions", "next_review"]


class FlashcardCreateSerializer(serializers.ModelSerializer):
    """For creating flashcards (e.g. from exam incorrect answers)."""

    class Meta:
        model = Flashcard
        fields = ["id", "front", "back"]
        read_only_fields = ["id"]


class FlashcardReviewSerializer(serializers.Serializer):
    """Validates SRS review quality rating."""
    quality = serializers.IntegerField(min_value=0, max_value=3)


class DeckSerializer(serializers.ModelSerializer):
    flashcards = FlashcardSerializer(many=True, read_only=True)
    card_count = serializers.SerializerMethodField()
    due_count = serializers.SerializerMethodField()

    class Meta:
        model = Deck
        fields = ["id", "name", "description", "flashcards", "card_count", "due_count"]
        read_only_fields = ["id"]

    def get_card_count(self, obj):
        return obj.flashcards.count()

    def get_due_count(self, obj):
        from django.utils import timezone
        return obj.flashcards.filter(next_review__lte=timezone.now()).count()

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user_profile
        return super().create(validated_data)
