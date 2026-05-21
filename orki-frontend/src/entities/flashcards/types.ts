export type Flashcard = {
  id: string;
  front: string;
  back: string;
  deck: string;
  is_due: boolean;
  interval: number;
  ease_factor: number;
  repetitions: number;
  next_review: string;
};

export type SrsQuality = 0 | 1 | 2 | 3; // Again, Hard, Good, Easy

export type SubjectDeck = {
  id: number;
  name: string;
  cardCount: number;
  dueCount: number;
  lastStudied: string | null;
};

// ─── Firestore-based Flashcard ────────────────────────────────────────────────

/**
 * A flashcard generated on-the-fly from a Firestore question document.
 * Used by the Firestore-driven flashcard viewer.
 */
export type FirestoreFlashcard = {
  /** Firestore question document ID, e.g. "ENG-001" */
  id: string;
  /** The question text shown on the front of the card */
  front: string;
  /** Subject name, e.g. "English" */
  subject: string;
  /** Topic/subtopic from the question, e.g. "Grammar" */
  topic: string;
  /** Difficulty level: "Easy" | "Medium" | "Hard" */
  difficulty: string;
  /** Multiple-choice options */
  choices: { A: string; B: string; C?: string; D?: string };
  /** The correct answer letter, e.g. "C" */
  correctAnswerKey: string;
  /** Full correct answer text, e.g. "She doesn't like apples." */
  correctAnswerText: string;
  /** Explanation shown on the back of the card */
  explanation: string;
};

// ─── Flashcard session progress ───────────────────────────────────────────────

/** Persisted in localStorage to allow resume-session flows. */
export type FlashcardProgress = {
  examType: string;
  subject: string;
  currentIndex: number;
  lastUpdated: string; // ISO timestamp
};

// ─── User-converted Flashcard Decks ──────────────────────────────────────────

/** A single card within a user-converted flashcard deck. */
export type ConvertedFlashcardCard = {
  /** Question document ID or a generated ID for locally-sourced cards. */
  id: string;
  /** Question text shown on the card front. */
  front: string;
  /** Full text of the correct answer shown on the card back. */
  back: string;
  /** Optional explanation shown below the answer. */
  explanation: string;
  /** Topic/category label, e.g. "Criminal Law". */
  category: string;
  /** All answer choices for reference. */
  choices: { A: string; B: string; C?: string; D?: string };
  /** The correct answer letter: A, B, C, or D. */
  correct_answer: string;
};

/** A flashcard deck created by converting an exam attempt's incorrect answers. */
export type ConvertedFlashcardDeck = {
  /** Firestore document ID. */
  id: string;
  user_id: string;
  /** Human-readable deck name, e.g. "Criminalistics — CLE (May 21, 2026)". */
  name: string;
  /** Source type — always "exam_attempt" for exam-derived decks. */
  source: "exam_attempt";
  /** Firestore exam_attempts document ID that this deck was derived from. */
  source_id: string;
  cards: ConvertedFlashcardCard[];
  card_count: number;
  created_at: Date | null;
};
