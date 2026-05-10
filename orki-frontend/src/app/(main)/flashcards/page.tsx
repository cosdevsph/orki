"use client";

import { useState } from "react";

import type { Flashcard } from "@/entities/flashcards/types";
import { DeckCard } from "@/widgets/flashcards/deck-card";
import { FlashcardViewer } from "@/widgets/flashcards/flashcard-viewer";

// ─── Mock Data ────────────────────────────────────────────────────────────────

type Deck = {
  id: string;
  name: string;
  cardCount: number;
  dueCount: number;
  lastStudied: string;
  color: string;
  cards: Flashcard[];
};

const DECKS: Deck[] = [
  {
    id: "anatomy",
    name: "Anatomy",
    cardCount: 84,
    dueCount: 12,
    lastStudied: "2 hours ago",
    color: "#2FA2E2",
    cards: [
      { id: "a1", front: "What is the rotator cuff composed of?", back: "Supraspinatus, Infraspinatus, Teres Minor, Subscapularis (SITS)", deck: "Anatomy", is_due: true, interval: 0, ease_factor: 2.5, repetitions: 0, next_review: "" },
      { id: "a2", front: "Which nerve innervates the deltoid muscle?", back: "Axillary nerve (C5, C6)", deck: "Anatomy", is_due: true, interval: 0, ease_factor: 2.5, repetitions: 0, next_review: "" },
      { id: "a3", front: "What is the carpal tunnel formed by?", back: "The flexor retinaculum and the carpal bones", deck: "Anatomy", is_due: false, interval: 6, ease_factor: 2.5, repetitions: 2, next_review: "" },
      { id: "a4", front: "Which muscle is the prime mover for shoulder abduction?", back: "Deltoid (first 15° by supraspinatus)", deck: "Anatomy", is_due: true, interval: 0, ease_factor: 2.5, repetitions: 0, next_review: "" },
    ],
  },
  {
    id: "physio",
    name: "Physiology",
    cardCount: 132,
    dueCount: 24,
    lastStudied: "Yesterday",
    color: "#10B981",
    cards: [
      { id: "p1", front: "What is the Frank-Starling mechanism?", back: "Increased preload → increased stretch → increased force of contraction", deck: "Physiology", is_due: true, interval: 0, ease_factor: 2.5, repetitions: 0, next_review: "" },
      { id: "p2", front: "Define cardiac output", back: "Heart rate × Stroke volume (CO = HR × SV)", deck: "Physiology", is_due: true, interval: 0, ease_factor: 2.5, repetitions: 0, next_review: "" },
      { id: "p3", front: "What is the normal resting heart rate?", back: "60–100 beats per minute", deck: "Physiology", is_due: false, interval: 10, ease_factor: 2.65, repetitions: 3, next_review: "" },
    ],
  },
  {
    id: "biochem",
    name: "Biochemistry",
    cardCount: 67,
    dueCount: 8,
    lastStudied: "3 days ago",
    color: "#8B5CF6",
    cards: [
      { id: "b1", front: "What is Km?", back: "The substrate concentration at which reaction velocity is half of Vmax (Michaelis constant)", deck: "Biochemistry", is_due: true, interval: 0, ease_factor: 2.5, repetitions: 0, next_review: "" },
      { id: "b2", front: "What is competitive inhibition?", back: "Inhibitor competes with substrate for active site; increases apparent Km, unchanged Vmax", deck: "Biochemistry", is_due: true, interval: 0, ease_factor: 2.5, repetitions: 0, next_review: "" },
    ],
  },
  {
    id: "pharma",
    name: "Pharmacology",
    cardCount: 98,
    dueCount: 31,
    lastStudied: "Today",
    color: "#F59E0B",
    cards: [
      { id: "ph1", front: "Mechanism of action of penicillin", back: "Inhibits transpeptidase (PBP), preventing cross-linking of peptidoglycan cell wall", deck: "Pharmacology", is_due: true, interval: 0, ease_factor: 2.5, repetitions: 0, next_review: "" },
      { id: "ph2", front: "What is the first-line treatment for MRSA?", back: "Vancomycin (for serious infections)", deck: "Pharmacology", is_due: true, interval: 0, ease_factor: 2.5, repetitions: 0, next_review: "" },
    ],
  },
  {
    id: "patho",
    name: "Pathology",
    cardCount: 115,
    dueCount: 5,
    lastStudied: "Yesterday",
    color: "#EF4444",
    cards: [
      { id: "pt1", front: "What are the cardinal signs of inflammation?", back: "Rubor (redness), Calor (heat), Tumor (swelling), Dolor (pain), Functio laesa (loss of function)", deck: "Pathology", is_due: true, interval: 0, ease_factor: 2.5, repetitions: 0, next_review: "" },
      { id: "pt2", front: "What is the hallmark of acute inflammation?", back: "Neutrophil infiltration", deck: "Pathology", is_due: false, interval: 6, ease_factor: 2.5, repetitions: 2, next_review: "" },
    ],
  },
  {
    id: "micro",
    name: "Microbiology",
    cardCount: 73,
    dueCount: 18,
    lastStudied: "4 days ago",
    color: "#06B6D4",
    cards: [
      { id: "m1", front: "What is the replication cycle of HIV?", back: "Attachment → Fusion → Reverse transcription → Integration → Transcription → Assembly → Budding", deck: "Microbiology", is_due: true, interval: 0, ease_factor: 2.5, repetitions: 0, next_review: "" },
      { id: "m2", front: "Gram-positive vs Gram-negative cell wall", back: "G+: thick peptidoglycan, no outer membrane. G-: thin peptidoglycan, outer membrane with LPS", deck: "Microbiology", is_due: true, interval: 0, ease_factor: 2.5, repetitions: 0, next_review: "" },
    ],
  },
];

const TOTAL_DUE = DECKS.reduce((a, d) => a + d.dueCount, 0);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FlashcardsPage() {
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);

  if (activeDeck) {
    return (
      <div className="animate-page-in mx-auto max-w-3xl py-4">
        <FlashcardViewer
          cards={activeDeck.cards}
          deckName={activeDeck.name}
          onClose={() => setActiveDeck(null)}
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
            <p className="font-heading text-lg font-bold text-primary">{TOTAL_DUE}</p>
            <p className="text-[10px] text-muted leading-none">cards due</p>
          </div>
        </div>
      </div>

      {/* Decks grid */}
      <div className="grid grid-cols-3 gap-4">
        {DECKS.map((deck) => (
          <DeckCard
            key={deck.id}
            name={deck.name}
            cardCount={deck.cardCount}
            dueCount={deck.dueCount}
            lastStudied={deck.lastStudied}
            color={deck.color}
            onStudy={() => setActiveDeck(deck)}
          />
        ))}
      </div>

      {/* Study all due CTA */}
      {TOTAL_DUE > 0 && (
        <div
          className="card-hover flex items-center justify-between rounded-2xl p-5"
          style={{
            background:
              "linear-gradient(135deg, rgba(47,162,226,0.1) 0%, rgba(139,92,246,0.07) 100%)",
            border: "1px solid rgba(47,162,226,0.18)",
          }}
        >
          <div className="space-y-1">
            <h3 className="font-heading text-lg font-bold text-foreground">
              You have {TOTAL_DUE} cards due across all decks
            </h3>
            <p className="text-sm text-muted">
              Reviewing today keeps your retention sharp and streaks alive.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveDeck(DECKS[0])}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-150 hover:bg-primary/90 hover:shadow-primary/25 active:scale-95"
          >
            Study All Due
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M5.25 2.917 9.333 7 5.25 11.083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

