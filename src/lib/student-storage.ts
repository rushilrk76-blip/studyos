import {
  isBoardId,
  isStreamId,
  type OnboardingDraft,
  type StudentProfile,
} from "@/lib/student";

/*
  ────────────────────────────────────────────────
  localStorage persistence (client-side only).

  Two keys:
  - DRAFT_KEY:   the onboarding wizard, so a refresh
                 mid-setup doesn't lose your choices
  - PROFILE_KEY: the finished student profile

  Every loader validates the parsed JSON with the
  guards from student.ts — storage is untrusted input.
  All functions no-op safely during server rendering.
  ────────────────────────────────────────────────
*/

const DRAFT_KEY = "studyos:onboarding-draft:v1";
const PROFILE_KEY = "studyos:student-profile:v1";

function read(key: string): unknown {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // corrupted JSON → treat as empty
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full / private mode — the app keeps working without saving.
  }
}

function remove(key: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}

/* ── Onboarding draft ───────────────────────── */
export function loadDraft(): OnboardingDraft | null {
  const value = read(DRAFT_KEY);
  if (!value || typeof value !== "object") return null;

  const o = value as Record<string, unknown>;
  const photo =
    typeof o.photoDataUrl === "string" && o.photoDataUrl.startsWith("data:image/")
      ? o.photoDataUrl
      : null;

  return {
    board: isBoardId(o.board) ? o.board : null,
    stream: isStreamId(o.stream) ? o.stream : null,
    name: typeof o.name === "string" ? o.name : "",
    photoDataUrl: photo,
  };
}

export function saveDraft(draft: OnboardingDraft): void {
  write(DRAFT_KEY, draft);
}

export function clearDraft(): void {
  remove(DRAFT_KEY);
}

/* ── Finished profile ───────────────────────── */
export function loadProfile(): StudentProfile | null {
  const value = read(PROFILE_KEY);
  if (!value || typeof value !== "object") return null;

  const o = value as Record<string, unknown>;
  if (!isBoardId(o.board) || !isStreamId(o.stream)) return null;
  if (typeof o.name !== "string" || o.name.trim().length === 0) return null;

  const photo =
    typeof o.photoDataUrl === "string" && o.photoDataUrl.startsWith("data:image/")
      ? o.photoDataUrl
      : null;

  return {
    name: o.name,
    board: o.board,
    stream: o.stream,
    photoDataUrl: photo,
    createdAt: typeof o.createdAt === "string" ? o.createdAt : "",
    studentId: typeof o.studentId === "string" ? o.studentId : "",
  };
}

export function saveProfile(profile: StudentProfile): void {
  write(PROFILE_KEY, profile);
}

export function clearProfile(): void {
  remove(PROFILE_KEY);
}
