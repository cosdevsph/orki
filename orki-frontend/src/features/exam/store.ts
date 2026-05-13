/**
 * Zustand store for the active exam session.
 *
 * Single source of truth for:
 *   - elapsed timer
 *   - per-question answers
 *   - live correct / wrong counts
 *   - current question index
 *   - session status (idle | active | paused | completed)
 *
 * Firestore persistence (exam_sessions collection) is coordinated
 * by the ExamTakePage component — the store holds the in-memory state
 * and the page decides when to flush it to Firestore.
 */

import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ExamStatus = "idle" | "active" | "paused" | "completed";

export type ExamStoreState = {
  /** Firestore exam_sessions document ID — null until the session is created. */
  sessionId: string | null;
  examType: string;
  subject: string;
  /** Map of questionId → selected answer letter. */
  answers: Record<string, "A" | "B" | "C" | "D">;
  /** Running count of correct answers. */
  correct: number;
  /** Running count of wrong answers. */
  wrong: number;
  /** 0-based index of the currently displayed question. */
  currentIndex: number;
  /** Total seconds elapsed since exam start (timer counts up, no limit). */
  elapsedTime: number;
  status: ExamStatus;
};

type ExamStoreActions = {
  /**
   * Initialise (or restore) a session.
   * Pass `restored` fields when loading an existing Firestore session.
   */
  initSession: (
    sessionId: string,
    examType: string,
    subject: string,
    restored?: Partial<
      Pick<
        ExamStoreState,
        "answers" | "correct" | "wrong" | "currentIndex" | "elapsedTime"
      >
    >,
  ) => void;

  /**
   * Record a question answer.
   * Callers must supply `wasCorrect` (derived from the question's correct_answer).
   * If the user is *changing* a previous answer, supply `prevWasCorrect` too
   * so the running tally stays consistent.
   */
  recordAnswer: (
    questionId: string,
    answer: "A" | "B" | "C" | "D",
    wasCorrect: boolean,
    prevWasCorrect?: boolean,
  ) => void;

  setCurrentIndex: (index: number) => void;

  /** Increment elapsed time by 1 second — call from a 1-second interval. */
  tick: () => void;

  pause: () => void;
  resume: () => void;
  complete: () => void;

  /** Reset everything back to the initial idle state. */
  resetSession: () => void;
};

export type ExamStore = ExamStoreState & ExamStoreActions;

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL_STATE: ExamStoreState = {
  sessionId: null,
  examType: "",
  subject: "",
  answers: {},
  correct: 0,
  wrong: 0,
  currentIndex: 0,
  elapsedTime: 0,
  status: "idle",
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useExamStore = create<ExamStore>((set) => ({
  ...INITIAL_STATE,

  initSession: (sessionId, examType, subject, restored) =>
    set({
      sessionId,
      examType,
      subject,
      answers: restored?.answers ?? {},
      correct: restored?.correct ?? 0,
      wrong: restored?.wrong ?? 0,
      currentIndex: restored?.currentIndex ?? 0,
      elapsedTime: restored?.elapsedTime ?? 0,
      status: "active",
    }),

  recordAnswer: (questionId, answer, wasCorrect, prevWasCorrect) =>
    set((state) => {
      const hadPrev = prevWasCorrect !== undefined;
      let { correct, wrong } = state;

      // Undo the effect of the previous answer
      if (hadPrev) {
        if (prevWasCorrect) correct--;
        else wrong--;
      }

      // Apply the new answer
      if (wasCorrect) correct++;
      else wrong++;

      return {
        answers: { ...state.answers, [questionId]: answer },
        correct,
        wrong,
      };
    }),

  setCurrentIndex: (index) => set({ currentIndex: index }),

  tick: () =>
    set((state) =>
      state.status === "active"
        ? { elapsedTime: state.elapsedTime + 1 }
        : {},
    ),

  pause: () => set({ status: "paused" }),

  resume: () => set({ status: "active" }),

  complete: () => set({ status: "completed" }),

  resetSession: () => set(INITIAL_STATE),
}));
