/**
 * Centralized exam-type personalization utilities.
 *
 * All exam-type → content mappings live here so every page stays in sync.
 * Import helpers from this file rather than scattering conditionals across pages.
 */

export type ExamType = "LEPT" | "CSE" | "PmLE" | "CLE";

// ─── Professional Title ───────────────────────────────────────────────────────

export const PROFESSIONAL_TITLE_MAP: Record<ExamType, string> = {
  LEPT: "LPT",
  CSE: "CSE Passer",
  PmLE: "RPM",
  CLE: "RCrim",
};

export const EXAM_FULL_NAME_MAP: Record<ExamType, string> = {
  LEPT: "Licensure Examination for Professional Teachers",
  CSE: "Career Service Examination",
  PmLE: "Psychometricians Licensure Examination",
  CLE: "Criminologist Licensure Examination",
};

export const EXAM_SHORT_NAME_MAP: Record<ExamType, string> = {
  LEPT: "LEPT",
  CSE: "CSE",
  PmLE: "PmLE",
  CLE: "CLE",
};

// ─── Subject Mastery ──────────────────────────────────────────────────────────

export interface SubjectMastery {
  name: string;
  color: string;
  score: number;
}

/** Color palette for subjects by index — used when real API data has no color. */
export const SUBJECT_COLORS = [
  "#2FA2E2",
  "#10B981",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
];

/** Dataset-aligned subjects for each exam type (matches actual JSON dataset files). */
export const SUBJECTS_BY_EXAM: Record<ExamType, SubjectMastery[]> = {
  LEPT: [
    { name: "English", color: "#2FA2E2", score: 0 },
    { name: "Filipino", color: "#10B981", score: 0 },
    { name: "Mathematics", color: "#8B5CF6", score: 0 },
    { name: "Science", color: "#F59E0B", score: 0 },
    { name: "Social Science", color: "#EF4444", score: 0 },
  ],
  CSE: [
    { name: "Verbal Ability", color: "#2FA2E2", score: 0 },
    { name: "Numerical Ability", color: "#10B981", score: 0 },
    { name: "Analytical Ability", color: "#8B5CF6", score: 0 },
    { name: "General Information", color: "#F59E0B", score: 0 },
  ],
  PmLE: [
    { name: "Abnormal Psychology", color: "#2FA2E2", score: 0 },
    { name: "Developmental Psychology", color: "#10B981", score: 0 },
    { name: "Industrial Psychology", color: "#8B5CF6", score: 0 },
    { name: "Psychological Assessment", color: "#F59E0B", score: 0 },
  ],
  CLE: [
    { name: "Criminal Law", color: "#2FA2E2", score: 0 },
    { name: "Criminology", color: "#10B981", score: 0 },
    { name: "Forensic Science", color: "#8B5CF6", score: 0 },
    { name: "Law Enforcement", color: "#F59E0B", score: 0 },
  ],
};

// ─── Exam Catalog Categories ──────────────────────────────────────────────────

/** Maps user exam_type to relevant MockExam category codes shown in the catalog. */
export const EXAM_CATALOG_CATEGORIES: Record<ExamType, string[]> = {
  LEPT: ["LET_GENED", "LET_PROFEDU"],
  CSE: ["CSE_PROF", "CSE_SUBPROF"],
  PmLE: ["PMLE_MAIN"],
  CLE: ["CLE_MAIN"],
};

/** Category filter tabs visible per exam type. */
export const CATEGORY_TABS_BY_EXAM: Record<
  ExamType,
  Array<{ key: string; label: string }>
> = {
  LEPT: [
    { key: "", label: "All Exams" },
    { key: "LET_GENED", label: "LET Gen Ed" },
    { key: "LET_PROFEDU", label: "LET Prof Ed" },
  ],
  CSE: [
    { key: "", label: "All Exams" },
    { key: "CSE_PROF", label: "CSE Professional" },
    { key: "CSE_SUBPROF", label: "CSE Sub-Professional" },
  ],
  PmLE: [
    { key: "", label: "All Exams" },
    { key: "PMLE_MAIN", label: "PmLE Main" },
  ],
  CLE: [
    { key: "", label: "All Exams" },
    { key: "CLE_MAIN", label: "CLE Main" },
  ],
};

// ─── Flashcard Decks ──────────────────────────────────────────────────────────

export interface FlashcardDeckTemplate {
  id: string;
  name: string;
  color: string;
  cardCount: number;
  dueCount: number;
  lastStudied: string;
}

export const FLASHCARD_DECKS_BY_EXAM: Record<ExamType, FlashcardDeckTemplate[]> = {
  LEPT: [
    { id: "english", name: "English", color: "#2FA2E2", cardCount: 0, dueCount: 0, lastStudied: "Not yet" },
    { id: "filipino", name: "Filipino", color: "#10B981", cardCount: 0, dueCount: 0, lastStudied: "Not yet" },
    { id: "mathematics", name: "Mathematics", color: "#8B5CF6", cardCount: 0, dueCount: 0, lastStudied: "Not yet" },
    { id: "science", name: "Science", color: "#F59E0B", cardCount: 0, dueCount: 0, lastStudied: "Not yet" },
    { id: "social-science", name: "Social Science", color: "#EF4444", cardCount: 0, dueCount: 0, lastStudied: "Not yet" },
  ],
  CSE: [
    { id: "verbal", name: "Verbal Ability", color: "#2FA2E2", cardCount: 0, dueCount: 0, lastStudied: "Not yet" },
    { id: "numerical", name: "Numerical Ability", color: "#10B981", cardCount: 0, dueCount: 0, lastStudied: "Not yet" },
    { id: "analytical", name: "Analytical Ability", color: "#8B5CF6", cardCount: 0, dueCount: 0, lastStudied: "Not yet" },
    { id: "general-info", name: "General Information", color: "#F59E0B", cardCount: 0, dueCount: 0, lastStudied: "Not yet" },
  ],
  PmLE: [
    { id: "abnormal-psych", name: "Abnormal Psychology", color: "#2FA2E2", cardCount: 0, dueCount: 0, lastStudied: "Not yet" },
    { id: "dev-psych", name: "Developmental Psychology", color: "#10B981", cardCount: 0, dueCount: 0, lastStudied: "Not yet" },
    { id: "industrial-psych", name: "Industrial Psychology", color: "#8B5CF6", cardCount: 0, dueCount: 0, lastStudied: "Not yet" },
    { id: "psych-assessment", name: "Psychological Assessment", color: "#F59E0B", cardCount: 0, dueCount: 0, lastStudied: "Not yet" },
  ],
  CLE: [
    { id: "criminal-law", name: "Criminal Law", color: "#2FA2E2", cardCount: 0, dueCount: 0, lastStudied: "Not yet" },
    { id: "criminology", name: "Criminology", color: "#10B981", cardCount: 0, dueCount: 0, lastStudied: "Not yet" },
    { id: "forensic-science", name: "Forensic Science", color: "#8B5CF6", cardCount: 0, dueCount: 0, lastStudied: "Not yet" },
    { id: "law-enforcement", name: "Law Enforcement", color: "#F59E0B", cardCount: 0, dueCount: 0, lastStudied: "Not yet" },
  ],
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

export function getProfessionalTitle(examType: string | null | undefined): string {
  if (!examType) return "Professional";
  return PROFESSIONAL_TITLE_MAP[examType as ExamType] ?? "Professional";
}

export function getExamFullName(examType: string | null | undefined): string {
  if (!examType) return "Your Examination";
  return EXAM_FULL_NAME_MAP[examType as ExamType] ?? "Your Examination";
}

export function getSubjectsByExam(examType: string | null | undefined): SubjectMastery[] {
  if (!examType) return SUBJECTS_BY_EXAM.LEPT;
  return SUBJECTS_BY_EXAM[examType as ExamType] ?? SUBJECTS_BY_EXAM.LEPT;
}

export function getFlashcardDecksByExam(
  examType: string | null | undefined,
): FlashcardDeckTemplate[] {
  if (!examType) return FLASHCARD_DECKS_BY_EXAM.LEPT;
  return FLASHCARD_DECKS_BY_EXAM[examType as ExamType] ?? FLASHCARD_DECKS_BY_EXAM.LEPT;
}

export function getCategoryTabsByExam(
  examType: string | null | undefined,
): Array<{ key: string; label: string }> {
  if (!examType) return [{ key: "", label: "All Exams" }];
  return (
    CATEGORY_TABS_BY_EXAM[examType as ExamType] ?? [{ key: "", label: "All Exams" }]
  );
}
