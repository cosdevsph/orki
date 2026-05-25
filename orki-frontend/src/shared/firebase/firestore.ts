/**
 * Firestore query utilities — single source of truth for all Firestore reads
 * and writes performed by the Orki frontend.
 *
 * Collections:
 *   subjects        — one doc per subject, keyed by exam_type
 *   questions       — one doc per question; filterable by exam_type + subject
 *   exam_attempts   — written on every exam submission for analytics
 *   exam_sessions   — live session state for pause/resume support
 *   analytics       — aggregated analytics written on exam completion
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import type {
  FirestoreAnalyticsInput,
  FirestoreExamAttemptInput,
  FirestoreExamSession,
  FirestoreExamSessionInput,
  FirestoreQuestion,
  FirestoreSubject,
} from "@/entities/exams/types";

import type {
  ConvertedFlashcardCard,
  ConvertedFlashcardDeck,
} from "@/entities/flashcards/types";

import { db } from "./client";

// ─── Subjects ─────────────────────────────────────────────────────────────────

/**
 * Fetch all subjects that belong to a given exam_type.
 *
 * Subjects documents have shape: { exam_type, name, slug }.
 * No `order` or `question_count` fields are present — those are derived
 * client-side (color from palette, ordering from insertion/alphabetical).
 *
 * Uses a single equality filter only — no composite index required.
 */
export async function getSubjectsByExamType(
  examType: string,
): Promise<FirestoreSubject[]> {
  const q = query(
    collection(db, "subjects"),
    where("exam_type", "==", examType),
  );
  const snap = await getDocs(q);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docs = snap.docs.map((doc: any) => ({
    id: doc.id,
    ...(doc.data() as Omit<FirestoreSubject, "id">),
  }));
  // Sort alphabetically by name for stable ordering
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return docs.sort((a: any, b: any) => a.name.localeCompare(b.name));
}

// ─── Questions ────────────────────────────────────────────────────────────────

/**
 * Fetch questions filtered by exam_type and subject.
 * Returns up to `limit` questions (default 100).
 *
 * Uses two equality filters only — no composite index required.
 * orderBy is intentionally omitted to avoid requiring a Firestore
 * composite index at this stage.
 */
export async function getQuestionsBySubject(
  examType: string,
  subject: string,
  limit = 100,
): Promise<FirestoreQuestion[]> {
  const q = query(
    collection(db, "questions"),
    where("exam_type", "==", examType),
    where("subject", "==", subject),
  );
  const snap = await getDocs(q);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docs = snap.docs.map((doc: any) => ({
    id: doc.id,
    ...(doc.data() as Omit<FirestoreQuestion, "id">),
  }));
  return docs.slice(0, limit);
}

// ─── Exam Attempts (Analytics) ────────────────────────────────────────────────

// ─── Attempt Monitoring Helpers (internal) ───────────────────────────────────

/**
 * Sanitize a string segment for use in a human-readable attempt_id.
 * Lowercases and strips all non-alphanumeric characters.
 */
function sanitizeSegment(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Count how many exam attempts a user has already saved for a given
 * exam_type + subject pair.  Used to determine the next attempt_number.
 *
 * Requires a Firestore composite index on exam_attempts:
 *   user_id (ASC), exam_type (ASC), subject (ASC)
 * Firestore will surface a console link to create the index on first query
 * if it does not yet exist.
 */
async function countPreviousAttempts(
  userId: string,
  examType: string,
  subject: string,
): Promise<number> {
  const q = query(
    collection(db, "exam_attempts"),
    where("user_id", "==", userId),
    where("exam_type", "==", examType),
    where("subject", "==", subject),
  );
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

/**
 * Generate attempt metadata for a new submission:
 *   attempt_number — 1-based retake count for this user / exam_type / subject
 *   attempt_id     — deterministic, URL-safe ID for routing and comparison
 *
 * attempt_id format: {userId}_{examType}_{sanitizedSubject}_{attemptNumber}
 * Example: "1iwucGlq82gzLqaondYsUxGQa702_pmle_abnormalpsychology_3"
 *
 * NOTE: There is an inherent low-probability race condition if the same user
 * submits the same exam from two browser tabs simultaneously.  For an
 * educational SaaS this is an acceptable tradeoff versus the complexity of
 * a full Firestore transaction.
 */
async function generateAttemptMetadata(
  userId: string,
  examType: string,
  subject: string,
): Promise<{ attempt_number: number; attempt_id: string }> {
  const existingCount = await countPreviousAttempts(userId, examType, subject);
  const attempt_number = existingCount + 1;
  const attempt_id = [
    userId,
    sanitizeSegment(examType),
    sanitizeSegment(subject),
    attempt_number,
  ].join("_");
  return { attempt_number, attempt_id };
}

/**
 * Persist a completed exam attempt to Firestore.
 * Writes to `exam_attempts/{autoId}` and returns the new document ID.
 *
 * This document is the source of truth for per-user analytics:
 *   score, subject mastery, weak topics, and history charts.
 *
 * Automatically generates and persists `attempt_number` and `attempt_id`
 * so that retakes can be tracked, compared, and charted over time.
 */
export async function saveExamAttempt(
  userId: string,
  attempt: FirestoreExamAttemptInput,
): Promise<string> {
  const { attempt_number, attempt_id } = await generateAttemptMetadata(
    userId,
    attempt.exam_type,
    attempt.subject,
  );
  const ref = await addDoc(collection(db, "exam_attempts"), {
    user_id: userId,
    ...attempt,
    attempt_number,
    attempt_id,
    completed_at: serverTimestamp(),
  });
  return ref.id;
}

// ─── Exam Sessions ────────────────────────────────────────────────────────────

/**
 * Create a new exam session document and return its ID.
 * Called when a user starts a fresh exam (no prior session found).
 */
export async function createExamSession(
  userId: string,
  data: Omit<FirestoreExamSessionInput, "user_id">,
): Promise<string> {
  const ref = doc(collection(db, "exam_sessions"));
  await setDoc(ref, {
    user_id: userId,
    ...data,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Partially update an existing exam session (answers, index, elapsed time, status).
 */
export async function updateExamSession(
  sessionId: string,
  data: Partial<Omit<FirestoreExamSessionInput, "user_id">>,
): Promise<void> {
  await updateDoc(doc(db, "exam_sessions", sessionId), {
    ...data,
    updated_at: serverTimestamp(),
  });
}

/**
 * Load an exam session by ID. Returns null if the document does not exist.
 */
export async function getExamSession(
  sessionId: string,
): Promise<FirestoreExamSession | null> {
  const snap = await getDoc(doc(db, "exam_sessions", sessionId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<FirestoreExamSession, "id">) };
}

/**
 * Permanently delete an exam session (used on restart or after submission).
 */
export async function deleteExamSession(sessionId: string): Promise<void> {
  await deleteDoc(doc(db, "exam_sessions", sessionId));
}

// ─── Analytics ────────────────────────────────────────────────────────────────

/**
 * Fetch a completed exam attempt by its document ID.
 * Returns null if the document does not exist.
 *
 * Includes `attempt_number` and `attempt_id` for attempts saved after the
 * attempt-monitoring feature was introduced; older documents will have these
 * fields as `undefined` (handled gracefully by all callers).
 */
export async function getExamAttempt(
  attemptId: string,
): Promise<
  | (FirestoreExamAttemptInput & {
      id: string;
      user_id: string;
      completed_at: Date | null;
    })
  | null
> {
  const snap = await getDoc(doc(db, "exam_attempts", attemptId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    ...(data as FirestoreExamAttemptInput & { user_id: string }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    completed_at: (data as any).completed_at?.toDate?.() ?? null,
  };
}

/**
 * Fetch the most recent prior attempt for the same user / exam_type / subject.
 * Used by the results page to display score improvement or decline.
 *
 * Returns null when:
 *   - This is the first attempt (currentAttemptNumber <= 1)
 *   - No previous attempt document carries `attempt_number` (pre-feature data)
 *
 * Queries all attempts for the user / exam_type / subject combination and
 * filters client-side — safe for educational use where attempt counts are low.
 *
 * Requires a Firestore composite index on exam_attempts:
 *   user_id (ASC), exam_type (ASC), subject (ASC)
 */
export async function getPreviousAttempt(
  userId: string,
  examType: string,
  subject: string,
  currentAttemptNumber: number,
): Promise<{ score: number; attempt_number: number } | null> {
  if (currentAttemptNumber <= 1) return null;

  const q = query(
    collection(db, "exam_attempts"),
    where("user_id", "==", userId),
    where("exam_type", "==", examType),
    where("subject", "==", subject),
  );
  const snap = await getDocs(q);
  const targetNumber = currentAttemptNumber - 1;

  for (const d of snap.docs) {
    const data = d.data() as { score?: number; attempt_number?: number };
    if (data.attempt_number === targetNumber && typeof data.score === "number") {
      return { score: data.score, attempt_number: data.attempt_number };
    }
  }
  return null;
}

/**
 * Write a completed-exam analytics document to the `analytics` collection.
 * Powers dashboard progress charts, subject mastery, and weak-area detection.
 */
export async function saveAnalytics(
  userId: string,
  data: FirestoreAnalyticsInput,
): Promise<void> {
  await addDoc(collection(db, "analytics"), {
    user_id: userId,
    ...data,
    timestamp: serverTimestamp(),
  });
}

// ─── User-converted Flashcard Decks ──────────────────────────────────────────

/**
 * Save a flashcard deck derived from exam incorrect answers.
 * Writes to `user_flashcard_decks/{autoId}` and returns the new document ID.
 *
 * Collection: user_flashcard_decks
 */
export async function saveConvertedFlashcardDeck(
  userId: string,
  name: string,
  sourceAttemptId: string,
  cards: ConvertedFlashcardCard[],
): Promise<string> {
  const ref = await addDoc(collection(db, "user_flashcard_decks"), {
    user_id: userId,
    name,
    source: "exam_attempt",
    source_id: sourceAttemptId,
    cards,
    card_count: cards.length,
    created_at: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Fetch all flashcard decks previously converted by a user.
 * Returns an empty array when no decks exist.
 */
export async function getConvertedFlashcardDecks(
  userId: string,
): Promise<ConvertedFlashcardDeck[]> {
  const q = query(
    collection(db, "user_flashcard_decks"),
    where("user_id", "==", userId),
  );
  const snap = await getDocs(q);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return snap.docs.map((d: any) => ({
    id: d.id,
    ...(d.data() as Omit<ConvertedFlashcardDeck, "id" | "created_at">),
    created_at: d.data().created_at?.toDate?.() ?? null,
  }));
}

// ─── Subject Analytics (Flat /analytics/{uid} Collection) ────────────────────

export type SubjectAnalyticData = {
  totalTries: number;
  runningAverage: number;
  lastRecordedScore: number;
  subjectMastery: number;
};

export type StreakData = {
  currentStreak: number;
  lastActiveDate: string | null; // "YYYY-MM-DD" format
};

export type AnalyticsDocument = {
  examType: string;
  subjects: Record<string, SubjectAnalyticData>;
  streak: StreakData;
  activityGrid: Record<string, number>; // "YYYY-MM-DD" -> exam count
  currentWeekKey: string; // "YYYY-Www" ISO week format (e.g., "2026-W22")
  currentWeeklyHours: number; // Cumulative hours this week
  updatedAt: unknown;
};

/** Helper: Calculate ISO week key (YYYY-Www) from a date */
function getISOWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // ISO week starts on Monday
  d.setDate(d.getDate() - (d.getDay() || 7) + 1);
  const year = d.getFullYear();
  const firstDay = new Date(year, 0, 1);
  const weekNumber = Math.ceil(
    ((d.getTime() - firstDay.getTime()) / 86400000 + firstDay.getDay() + 1) / 7
  );
  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
}

/**
 * Update subject mastery, streak, activity grid, and weekly hours for a given exam completion.
 * Implements the mastery formula:
 *   totalTries = prev + 1
 *   runningAverage = ((prev_avg * prev_tries) + latestScore) / totalTries
 *   subjectMastery = (runningAverage * 0.4) + (latestScore * 0.6)
 *
 * Streak logic (using local date "YYYY-MM-DD"):
 *   - If today == lastActiveDate: maintain streak
 *   - If today == lastActiveDate + 1 day: increment streak
 *   - If today > lastActiveDate + 1 day: reset streak to 1
 *
 * Activity grid tracks daily exam counts for contribution visualization.
 * Weekly hours accumulates `timeSpentSeconds / 3600` (fractional hours) per exam.
 * Writes to flat collection: `/analytics/{userId}` document
 */
export async function updateSubjectMastery(
  userId: string,
  examType: string,
  subject: string,
  latestScore: number,
  timeSpentSeconds: number = 0,
): Promise<void> {
  const analyticsRef = doc(db, "analytics", userId);

  try {
    // Get today's date in local time as "YYYY-MM-DD"
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const currentWeekKey = getISOWeekKey(today);

    // Convert exam time from seconds to fractional hours
    const hoursToAdd = timeSpentSeconds / 3600;

    const snap = await getDoc(analyticsRef);
    let analyticsData = snap.exists() ? (snap.data() as AnalyticsDocument) : null;

    // Initialize if doesn't exist
    if (!analyticsData || analyticsData.examType !== examType) {
      analyticsData = {
        examType,
        subjects: {},
        streak: {
          currentStreak: 1,
          lastActiveDate: todayStr,
        },
        activityGrid: {
          [todayStr]: 1,
        },
        currentWeekKey,
        currentWeeklyHours: hoursToAdd,
        updatedAt: null,
      };
    } else {
      // Initialize streak and activityGrid if missing (backward compatibility)
      if (!analyticsData.streak) {
        analyticsData.streak = {
          currentStreak: 1,
          lastActiveDate: todayStr,
        };
      }
      if (!analyticsData.activityGrid) {
        analyticsData.activityGrid = {};
      }

      // ─── Check if week boundary crossed — auto-reset weekly hours ───
      const storedWeekKey = analyticsData.currentWeekKey;
      if (storedWeekKey !== currentWeekKey) {
        // Week changed — reset weekly hours with this exam's time
        analyticsData.currentWeekKey = currentWeekKey;
        analyticsData.currentWeeklyHours = hoursToAdd;
      } else {
        // Same week — accumulate actual hours
        analyticsData.currentWeeklyHours = (analyticsData.currentWeeklyHours || 0) + hoursToAdd;
      }

      // ─── Update streak ───────────────────────────────────────────
      const lastActiveDate = analyticsData.streak.lastActiveDate;
      let currentStreak = analyticsData.streak.currentStreak;

      if (lastActiveDate !== todayStr) {
        // Different day — check continuity
        const lastDate = new Date(lastActiveDate || todayStr);
        const daysDiff = Math.floor(
          (new Date(todayStr).getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 1) {
          // Exactly 1 day gap — continue streak
          currentStreak += 1;
        } else if (daysDiff > 1) {
          // Gap > 1 day — reset streak
          currentStreak = 1;
        }
        // daysDiff === 0 shouldn't happen (already checked todayStr)
      }

      analyticsData.streak = {
        currentStreak,
        lastActiveDate: todayStr,
      };

      // ─── Update activity grid ─────────────────────────────────────
      analyticsData.activityGrid = analyticsData.activityGrid || {};
      analyticsData.activityGrid[todayStr] =
        (analyticsData.activityGrid[todayStr] ?? 0) + 1;
    }

    // ─── Update subject mastery ───────────────────────────────────────
    // Get existing subject stats or initialize
    const existing = analyticsData.subjects[subject] || {
      totalTries: 0,
      runningAverage: 0,
      lastRecordedScore: 0,
      subjectMastery: 0,
    };

    // Apply mastery formula
    const prevTotalTries = existing.totalTries;
    const prevRunningAverage = existing.runningAverage;
    const totalTries = prevTotalTries + 1;
    const runningAverage =
      (prevRunningAverage * prevTotalTries + latestScore) / totalTries;
    const subjectMastery = runningAverage * 0.4 + latestScore * 0.6;

    // Update subject data
    analyticsData.subjects[subject] = {
      totalTries,
      runningAverage: Math.round(runningAverage * 100) / 100,
      lastRecordedScore: latestScore,
      subjectMastery: Math.round(subjectMastery * 100) / 100,
    };

    // Write to Firestore
    await setDoc(analyticsRef, {
      ...analyticsData,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("[Firestore] updateSubjectMastery failed:", err);
    throw err;
  }
}

/**
 * Fetch the analytics document for a user.
 * Returns null if no analytics exist yet.
 */
export async function getAnalyticsDocument(
  userId: string,
): Promise<AnalyticsDocument | null> {
  try {
    const snap = await getDoc(doc(db, "analytics", userId));
    if (!snap.exists()) return null;
    return snap.data() as AnalyticsDocument;
  } catch (err) {
    console.error("[Firestore] getAnalyticsDocument failed:", err);
    return null;
  }
}
