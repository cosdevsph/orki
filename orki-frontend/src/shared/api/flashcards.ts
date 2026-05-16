/**
 * Firestore-driven flashcard API.
 *
 * Fetches real exam questions from Firestore, shuffles them, and converts
 * up to CARDS_PER_SUBJECT questions into FirestoreFlashcard objects.
 *
 * All Firestore reads go through the shared firestore.ts utilities so that
 * query logic stays in one place and is not duplicated here.
 */

import type { FirestoreFlashcard } from "@/entities/flashcards/types";
import type { FirestoreQuestion } from "@/entities/exams/types";
import { getQuestionsBySubject } from "@/shared/firebase/firestore";

const CARDS_PER_SUBJECT = 30;
const FETCH_LIMIT = 100; // Fetch more than 30 so we can shuffle and pick

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Fisher-Yates in-place shuffle. Returns the same array reference. */
function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i] as T;
    arr[i] = arr[j] as T;
    arr[j] = tmp;
  }
  return arr;
}

/** Map a Firestore question document to a FirestoreFlashcard. */
function toFlashcard(q: FirestoreQuestion): FirestoreFlashcard {
  const answerKey = q.correct_answer as keyof typeof q.choices;
  const answerText = q.choices[answerKey] ?? q.correct_answer;

  return {
    id: q.id,
    front: q.question,
    subject: q.subject,
    topic: q.topic,
    difficulty: q.difficulty,
    choices: q.choices,
    correctAnswerKey: q.correct_answer,
    correctAnswerText: answerText,
    explanation: q.explanation,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch up to 30 randomised flashcards for a given exam type + subject.
 *
 * Strategy:
 * 1. Query Firestore for up to FETCH_LIMIT questions matching exam_type + subject.
 * 2. Shuffle the results so card order is random on every session.
 * 3. Slice to CARDS_PER_SUBJECT to keep sessions focused.
 * 4. Map each question to a FirestoreFlashcard.
 *
 * Uses only equality filters — no composite Firestore index required.
 */
export async function getFlashcardsForSubject(
  examType: string,
  subject: string,
): Promise<FirestoreFlashcard[]> {
  const questions = await getQuestionsBySubject(examType, subject, FETCH_LIMIT);
  const shuffled = shuffleInPlace([...questions]); // copy before shuffle
  return shuffled.slice(0, CARDS_PER_SUBJECT).map(toFlashcard);
}
