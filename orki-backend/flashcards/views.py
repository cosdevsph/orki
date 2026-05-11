from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsSessionAuthenticated

from .models import Deck, Flashcard
from .serializers import (
    DeckSerializer,
    FlashcardCreateSerializer,
    FlashcardReviewSerializer,
    FlashcardSerializer,
)


class FlashcardListView(APIView):
    """
    GET /api/v1/flashcards/  — Return all flashcards for the user.
    Supports ?due=true and ?deck_id=<id> filters.
    """

    permission_classes = [IsSessionAuthenticated]

    def get(self, request):
        due_only = request.query_params.get("due", "").lower() == "true"
        deck_id = request.query_params.get("deck_id")

        flashcards = Flashcard.objects.filter(
            deck__user=request.user_profile
        ).select_related("deck")

        if deck_id:
            flashcards = flashcards.filter(deck_id=deck_id)

        if due_only:
            flashcards = flashcards.filter(next_review__lte=timezone.now())

        return Response(FlashcardSerializer(flashcards, many=True).data)


class FlashcardReviewView(APIView):
    """
    POST /api/v1/flashcards/<pk>/review/
    Apply SRS algorithm based on quality rating (0=Again, 1=Hard, 2=Good, 3=Easy).
    """

    permission_classes = [IsSessionAuthenticated]

    def post(self, request, pk):
        try:
            card = Flashcard.objects.get(pk=pk, deck__user=request.user_profile)
        except Flashcard.DoesNotExist:
            return Response({"detail": "Not found."}, status=404)
        
        serializer = FlashcardReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        quality = serializer.validated_data["quality"]
        card.review(quality)
        
        return Response(FlashcardSerializer(card).data)


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


class DeckDetailView(APIView):
    """
    POST /api/v1/flashcards/decks/<pk>/cards/  — Add a card to a deck.
    Used by the "Convert to Flashcards" feature.
    """

    permission_classes = [IsSessionAuthenticated]

    def post(self, request, pk):
        try:
            deck = Deck.objects.get(pk=pk, user=request.user_profile)
        except Deck.DoesNotExist:
            return Response({"detail": "Deck not found."}, status=404)
        
        serializer = FlashcardCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(deck=deck)
        return Response(serializer.data, status=201)


class BulkCreateFlashcardsView(APIView):
    """
    POST /api/v1/flashcards/bulk-create/
    Create multiple flashcards from exam incorrect answers.
    Expects: { deck_name: str, cards: [{ front: str, back: str }] }
    """

    permission_classes = [IsSessionAuthenticated]

    def post(self, request):
        deck_name = request.data.get("deck_name", "Exam Review")
        cards_data = request.data.get("cards", [])
        
        if not cards_data:
            return Response({"detail": "No cards provided."}, status=400)
        
        deck, _ = Deck.objects.get_or_create(
            user=request.user_profile,
            name=deck_name,
            defaults={"description": "Auto-created from exam incorrect answers"},
        )
        
        created = []
        for card_data in cards_data:
            serializer = FlashcardCreateSerializer(data=card_data)
            serializer.is_valid(raise_exception=True)
            card = serializer.save(deck=deck)
            created.append(card)
        
        return Response({
            "detail": f"{len(created)} flashcards created in deck '{deck.name}'.",
            "deck_id": deck.id,
            "count": len(created),
        }, status=201)


class SubjectDecksView(APIView):
    """
    GET /api/v1/flashcards/subject-decks/
    Returns dataset-driven subject decks for the user's exam type.
    Auto-seeds each deck with flashcards from the corresponding dataset JSON
    on first access (idempotent).
    """

    permission_classes = [IsSessionAuthenticated]

    def get(self, request):
        from services.datasets.loader import (  # noqa: PLC0415
            get_flashcard_pairs_for_subject,
            get_subjects_for_exam_type,
        )

        profile = request.user_profile
        exam_type = profile.exam_type
        if not exam_type:
            return Response([])

        subjects = get_subjects_for_exam_type(exam_type)
        result = []

        for subject in subjects:
            deck_name = f"[{exam_type}] {subject}"
            deck, _ = Deck.objects.get_or_create(
                user=profile,
                name=deck_name,
                defaults={"description": f"{subject} flashcards for {exam_type}"},
            )

            # Auto-seed from dataset if deck is empty
            if deck.flashcards.count() == 0:
                pairs = get_flashcard_pairs_for_subject(exam_type, subject)
                if pairs:
                    Flashcard.objects.bulk_create([
                        Flashcard(deck=deck, front=p["front"], back=p["back"])
                        for p in pairs
                    ])

            card_count = deck.flashcards.count()
            due_count = deck.flashcards.filter(next_review__lte=timezone.now()).count()
            last_reviewed = (
                deck.flashcards
                .filter(last_reviewed__isnull=False)
                .order_by("-last_reviewed")
                .values_list("last_reviewed", flat=True)
                .first()
            )

            result.append({
                "id": deck.id,
                "name": subject,
                "cardCount": card_count,
                "dueCount": due_count,
                "lastStudied": last_reviewed.isoformat() if last_reviewed else None,
            })

        return Response(result)
