import type { ConceptProgress } from "@/lib/practice/concept-types";

/*
  ────────────────────────────────────────────────
  localStorage for Physics & Chemistry practice.

  Its own key, separate from:
    studyos:practice-progress:v1  (Mathematics — untouched)
    studyos:syllabus-progress:v1  (theory)
    studyos:tasks:v1              (homework)

  Only completed question ids are stored; the practice
  structure itself stays in application data.
  ────────────────────────────────────────────────
*/

const KEY = "studyos:science-practice:v1";
const EMPTY: ConceptProgress = {};

export function loadSciencePractice(): ConceptProgress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object") return EMPTY;

    const clean: ConceptProgress = {};
    for (const [id, value] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      if (value === "completed") clean[id] = "completed";
    }
    return clean;
  } catch {
    return EMPTY;
  }
}

export function saveSciencePractice(progress: ConceptProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // Storage full / private browsing — UI still works this session.
  }
}

export function clearSciencePractice(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
