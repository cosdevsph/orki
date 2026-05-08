from rest_framework import serializers

from .models import Deck, Flashcard


class FlashcardSerializer(serializers.ModelSerializer):
    deck = serializers.CharField(source="deck.name", read_only=True)

    class Meta:
        model = Flashcard
        fields = ["id", "front", "back", "deck", "is_due"]
        read_only_fields = ["id"]


class DeckSerializer(serializers.ModelSerializer):
    flashcards = FlashcardSerializer(many=True, read_only=True)

    class Meta:
        model = Deck
        fields = ["id", "name", "flashcards"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user_profile
        return super().create(validated_data)
