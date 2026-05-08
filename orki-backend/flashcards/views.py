from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsSessionAuthenticated

from .models import Deck, Flashcard
from .serializers import DeckSerializer, FlashcardSerializer


class FlashcardListView(APIView):
    """
    GET /api/v1/flashcards/  — Return all due flashcards for the user,
                               flattened across all decks.
    """

    permission_classes = [IsSessionAuthenticated]

    def get(self, request):
        flashcards = Flashcard.objects.filter(
            deck__user=request.user_profile
        ).select_related("deck")
        return Response(FlashcardSerializer(flashcards, many=True).data)


class DeckListView(APIView):
    """
    GET  /api/v1/flashcards/decks/  — List all decks with their cards.
    POST /api/v1/flashcards/decks/  — Create a new deck.
    """

    permission_classes = [IsSessionAuthenticated]

    def get(self, request):
        decks = Deck.objects.filter(user=request.user_profile).prefetch_related("flashcards")
        return Response(DeckSerializer(decks, many=True).data)

    def post(self, request):
        serializer = DeckSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=201)
