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
