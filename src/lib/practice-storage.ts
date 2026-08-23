import type { QuestionProgress } from "@/lib/practice/types";

/*
  ────────────────────────────────────────────────
  localStorage persistence for question practice.

  Its own key, completely separate from the syllabus progress key —
  theory and practice are independent systems, so clearing or
  changing one never touches the other.

  Stores ONLY completed question ids. The practice structure
  itself is static application data and is never persisted.
  ────────────────────────────────────────────────
*/

const QUESTION_KEY = "studyos:practice-progress:v1";
const EMPTY: QuestionProgress = {};

export function loadQuestionProgress(): QuestionProgress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(QUESTION_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object") return EMPTY;

    const clean: QuestionProgress = {};
    for (const [questionId, value] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      if (value === "completed") clean[questionId] = "completed";
    }
    return clean;
  } catch {
    return EMPTY; // corrupted JSON → start empty, never crash
  }
}

export function saveQuestionProgress(progress: QuestionProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(QUESTION_KEY, JSON.stringify(progress));
  } catch {
    // Storage full / private browsing — UI still works this session.
  }
}

export function clearQuestionProgress(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(QUESTION_KEY);
}
