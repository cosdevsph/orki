"use client";

import { useState, useEffect } from "react";

import type { Flashcard } from "@/entities/flashcards/types";
import type { SubjectDeck } from "@/entities/flashcards/types";
import { DeckCard } from "@/widgets/flashcards/deck-card";
import { FlashcardViewer } from "@/widgets/flashcards/flashcard-viewer";
import { getSubjectDecks, getFlashcards, reviewFlashcard } from "@/shared/api/study";
import { SUBJECT_COLORS } from "@/shared/utils/exam-type";

function formatLastStudied(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return "Just now";
  if (diffH < 24) return "Today";
  if (diffH < 48) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<SubjectDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDeck, setActiveDeck] = useState<SubjectDeck | null>(null);
  const [deckCards, setDeckCards] = useState<Flashcard[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);

  useEffect(() => {
    getSubjectDecks()
      .then(setDecks)
      .catch(() => setDecks([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleStudy(deck: SubjectDeck) {
    setLoadingCards(true);
    try {
      const cards = await getFlashcards(false, deck.id);
      setDeckCards(cards);
      setActiveDeck(deck);
    } catch {
      setDeckCards([]);
    } finally {
      setLoadingCards(false);
    }
  }

  function handleClose() {
    setActiveDeck(null);
    setDeckCards([]);
    // Refresh decks so dueCount updates after review
    getSubjectDecks().then(setDecks).catch(() => {});
  }

  const totalDue = decks.reduce((a, d) => a + d.dueCount, 0);

  if (activeDeck) {
    return (
      <div className="animate-page-in mx-auto max-w-3xl py-4">
        <FlashcardViewer
          cards={deckCards}
          deckName={activeDeck.name}
          onClose={handleClose}
          onReview={(cardId, quality) => reviewFlashcard(cardId, quality).catch(() => {})}
        />
      </div>
    );
  }

  return (
    <div className="animate-page-in space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">Flashcards</h1>
          <p className="text-base text-muted">
            Spaced-repetition decks for long-term recall. Review what matters most.
          </p>
        </div>
        <div className="glass flex items-center gap-3 rounded-2xl px-4 py-2.5">
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <svg className="text-primary" width="16" height="16" viewBox="0 0 22 22" fill="none">
              <path d="M11 2c0 4-4 5.5-4 9a4 4 0 0 0 8 0c0-3.5-4-5-4-9Z" fill="currentColor" />
            </svg>
          </div>
          <div>
            <p className="font-heading text-lg font-bold text-primary">
              {loading ? "—" : totalDue}
            </p>
            <p className="text-[10px] text-muted leading-none">cards due</p>
          </div>
        </div>
      </div>

      {/* Decks grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="glass animate-pulse flex flex-col gap-4 rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div className="h-12 w-12 rounded-2xl bg-surface" />
                <div className="h-5 w-14 rounded-full bg-surface" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-28 rounded bg-surface" />
                <div className="h-3 w-20 rounded bg-surface" />
              </div>
              <div className="h-2 rounded-full bg-surface" />
              <div className="h-9 rounded-xl bg-surface mt-2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {decks.map((deck, idx) => (
            <DeckCard
              key={deck.id}
              name={deck.name}
              cardCount={deck.cardCount}
              dueCount={deck.dueCount}
              lastStudied={formatLastStudied(deck.lastStudied)}
              color={SUBJECT_COLORS[idx % SUBJECT_COLORS.length]}
              onStudy={() => handleStudy(deck)}
            />
          ))}
        </div>
      )}

      {loadingCards && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="glass rounded-2xl px-8 py-6 text-center space-y-3">
            <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm font-medium text-foreground">Loading flashcards…</p>
          </div>
        </div>
      )}

      {/* Study all due CTA */}
      {!loading && totalDue > 0 && decks.length > 0 && (
        <div
          className="card-hover flex items-center justify-between rounded-2xl p-5"
          style={{
            background: "linear-gradient(135deg, rgba(47,162,226,0.1) 0%, rgba(139,92,246,0.07) 100%)",
            border: "1px solid rgba(47,162,226,0.18)",
          }}
        >
          <div className="space-y-1">
            <h3 className="font-heading text-lg font-bold text-foreground">
              You have {totalDue} cards due across all decks
            </h3>
            <p className="text-sm text-muted">
              Reviewing today keeps your retention sharp and streaks alive.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const firstDue = decks.find((d) => d.dueCount > 0);
              if (firstDue) handleStudy(firstDue);
            }}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-150 hover:bg-primary/90 hover:shadow-primary/25 active:scale-95"
          >
            Study All Due
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M5.25 2.917 9.333 7 5.25 11.083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}

      {!loading && decks.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <svg width="40" height="40" viewBox="0 0 22 22" fill="none" className="text-muted/40">
            <rect x="2.75" y="6.417" width="16.5" height="11" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M6.417 6.417V5.042a1.833 1.833 0 0 1 1.833-1.834h5.5A1.833 1.833 0 0 1 15.583 5.042v1.375" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <p className="text-sm text-muted">No flashcard decks yet. Make sure your exam type is set in your profile.</p>
        </div>
      )}
    </div>
  );
}

