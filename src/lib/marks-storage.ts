import {
  EXAM_TYPES,
  type ExamResult,
  type ExamType,
} from "@/lib/marks/types";

/*
  ────────────────────────────────────────────────
  localStorage persistence for exam results.

  Its own key — separate from the syllabus, practice, science
  and tasks keys — so the five systems can never overwrite one
  another. Only the student's personal result records are
  stored; nothing is duplicated from other systems.

  The stored record deliberately holds only raw marks and
  maximum marks — never a saved percentage.
  ────────────────────────────────────────────────
*/

const RESULTS_KEY = "studyos:results:v1";

function isExamType(value: unknown): value is ExamType {
  return (
    typeof value === "string" && (EXAM_TYPES as readonly string[]).includes(value)
  );
}

function parseResult(value: unknown): ExamResult | null {
  if (!value || typeof value !== "object") return null;
  const o = value as Record<string, unknown>;

  if (typeof o.id !== "string" || o.id === "") return null;
  if (typeof o.examName !== "string" || o.examName.trim() === "") return null;
  if (typeof o.subject !== "string" || o.subject === "") return null;
  if (typeof o.marksObtained !== "number" || Number.isNaN(o.marksObtained))
    return null;
  if (typeof o.maximumMarks !== "number" || Number.isNaN(o.maximumMarks))
    return null;
  if (typeof o.examDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(o.examDate))
    return null;

  return {
    id: o.id,
    examName: o.examName,
    examType: isExamType(o.examType) ? o.examType : "Other",
    subject: o.subject,
    marksObtained: o.marksObtained,
    maximumMarks: o.maximumMarks,
    examDate: o.examDate,
    notes: typeof o.notes === "string" ? o.notes : "",
    createdAt: typeof o.createdAt === "string" ? o.createdAt : "",
  };
}

export function loadResults(): ExamResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RESULTS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(parseResult)
      .filter((result): result is ExamResult => result !== null);
  } catch {
    return []; // corrupted JSON → start empty, never crash
  }
}

export function saveResults(results: ExamResult[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
  } catch {
    // Storage full / private browsing — UI still works this session.
  }
}

export function clearResults(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(RESULTS_KEY);
}

/** Stable unique id, with a fallback for older browsers. */
export function createResultId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `result-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
