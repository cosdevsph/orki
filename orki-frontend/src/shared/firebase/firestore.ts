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
  const docs = snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<FirestoreSubject, "id">),
  }));
  // Sort alphabetically by name for stable ordering
  return docs.sort((a, b) => a.name.localeCompare(b.name));
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
  const docs = snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<FirestoreQuestion, "id">),
  }));
  return docs.slice(0, limit);
}

// ─── Exam Attempts (Analytics) ────────────────────────────────────────────────

/**
 * Persist a completed exam attempt to Firestore.
 * Writes to `exam_attempts/{autoId}` and returns the new document ID.
 *
 * This document is the source of truth for per-user analytics:
 *   score, subject mastery, weak topics, and history charts.
 */
export async function saveExamAttempt(
  userId: string,
  attempt: FirestoreExamAttemptInput,
): Promise<string> {
  const ref = await addDoc(collection(db, "exam_attempts"), {
    user_id: userId,
    ...attempt,
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
