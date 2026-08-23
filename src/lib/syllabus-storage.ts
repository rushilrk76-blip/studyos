import type { TopicProgress } from "@/lib/syllabus/types";

/*
  ────────────────────────────────────────────────
  localStorage persistence for syllabus progress.

  Key holds ONLY completed topic ids — no names, no personal
  data, nothing sensitive. When Supabase arrives, this file
  becomes a thin client over a table; callers won't change.
  ────────────────────────────────────────────────
*/

const PROGRESS_KEY = "studyos:syllabus-progress:v1";
const EMPTY_PROGRESS: TopicProgress = {};

export function loadTopicProgress(): TopicProgress {
  if (typeof window === "undefined") return EMPTY_PROGRESS;
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object") return EMPTY_PROGRESS;

    /* Keep only trustworthy entries: string keys with value "completed". */
    const clean: TopicProgress = {};
    for (const [topicId, value] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      if (value === "completed") clean[topicId] = "completed";
    }
    return clean;
  } catch {
    return EMPTY_PROGRESS; // corrupted JSON → start empty, never crash
  }
}

export function saveTopicProgress(progress: TopicProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Storage full / private browsing — the UI still works this session.
  }
}

export function clearTopicProgress(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROGRESS_KEY);
}
