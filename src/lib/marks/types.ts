import type { StreamId } from "@/lib/student";
import { subjectsForStream } from "@/lib/subjects";

/*
  ────────────────────────────────────────────────
  Marks & Exam Performance — the student's PERSONAL data.

  A fifth, completely independent system:

    1. Syllabus topics
    2. Maths practice
    3. Physics/Chemistry practice
    4. Homework tasks
    5. Exam results                              ← this file

  Recording a Physics result never touches syllabus,
  practice or homework. Each system has its own storage key.

  IMPORTANT: percentage is NEVER stored. Only the raw
  marksObtained and maximumMarks are saved — percentage is
  recalculated on demand, so editing a result later can never
  leave a stale, inconsistent percentage.
  ────────────────────────────────────────────────
*/

/* ── Exam type ──────────────────────────────── */
export const EXAM_TYPES = [
  "Class Test",
  "Unit Test",
  "Periodic Test",
  "Half Yearly",
  "Pre-Board",
  "Board Exam",
  "Assignment",
  "Other",
] as const;

export type ExamType = (typeof EXAM_TYPES)[number];

/* ── Subjects available in the form ─────────── */
export const EXTRA_MARK_SUBJECTS = ["English", "Other"] as const;

/** Stream-aware subject list (+ English, Other). We never invent subjects. */
export function markSubjectsForStream(stream: StreamId): string[] {
  return [
    ...subjectsForStream(stream).map((subject) => subject.name),
    ...EXTRA_MARK_SUBJECTS,
  ];
}

/* ── The result record ──────────────────────── */
export type ExamResult = {
  /** Stable unique id (crypto.randomUUID), never an array index. */
  id: string;
  examName: string;
  examType: ExamType;
  /** Subject name as chosen in the form, e.g. "Physics" or "English". */
  subject: string;
  marksObtained: number;
  maximumMarks: number;
  /** Local calendar date, "YYYY-MM-DD". */
  examDate: string;
  notes: string;
  createdAt: string; // ISO timestamp
};

/** The editable fields — what the add/edit form produces. */
export type ResultDraft = {
  examName: string;
  examType: ExamType;
  subject: string;
  marksObtained: string; // string in the input; parsed on submit
  maximumMarks: string;
  examDate: string;
  notes: string;
};

/* ── Derived performance ────────────────────── */
export type PerformanceGrade =
  | "excellent"
  | "good"
  | "needs-improvement"
  | "focus-needed";

export type PerformanceTrend = "improving" | "stable" | "declining" | "none";

export type ResultStats = {
  tests: number;
  averagePercent: number;
  bestPercent: number;
  latestPercent: number | null;
  trend: PerformanceTrend;
};

export type SubjectStats = {
  subject: string;
  tests: number;
  averagePercent: number;
  bestPercent: number;
  latestPercent: number | null;
};

export type ResultFilter = {
  subject: string; // "all" or a subject name
  examType: string; // "all" or an ExamType
  query: string;
};

export type ResultSort = "latest" | "oldest" | "highest" | "lowest";
