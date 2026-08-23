import {
  Dna,
  Landmark,
  Layers,
  School,
  Sigma,
  type LucideIcon,
} from "lucide-react";

/*
  ────────────────────────────────────────────────
  The student data model.

  Right now a profile is stored in the browser's
  localStorage (see student-storage.ts). When we add
  Supabase later, these exact types become the shape
  of the "students" table — nothing here has to change.
  ────────────────────────────────────────────────
*/

/* ── Boards ─────────────────────────────────── */
export const BOARDS = [
  {
    id: "cbse",
    name: "CBSE",
    fullName: "Central Board of Secondary Education",
    description: "Class 12 CBSE curriculum",
    icon: Landmark,
  },
  {
    id: "rbse",
    name: "RBSE",
    fullName: "Board of Secondary Education, Rajasthan",
    description: "Class 12 Rajasthan Board curriculum",
    icon: School,
  },
] as const;

export type BoardId = (typeof BOARDS)[number]["id"];

/* ── Streams ────────────────────────────────── */
export const STREAMS = [
  {
    id: "pcm",
    name: "PCM",
    description: "Physics + Chemistry + Mathematics",
    subjects: ["Physics", "Chemistry", "Mathematics"],
    icon: Sigma,
  },
  {
    id: "pcb",
    name: "PCB",
    description: "Physics + Chemistry + Biology",
    subjects: ["Physics", "Chemistry", "Biology"],
    icon: Dna,
  },
  {
    id: "pcmb",
    name: "PCMB",
    description: "Physics + Chemistry + Mathematics + Biology",
    subjects: ["Physics", "Chemistry", "Mathematics", "Biology"],
    icon: Layers,
  },
] as const;

export type StreamId = (typeof STREAMS)[number]["id"];

/* ── The profile itself ─────────────────────── */
export type StudentProfile = {
  name: string;
  board: BoardId;
  stream: StreamId;
  /** Compressed data-URL, or null when the student skipped the photo. */
  photoDataUrl: string | null;
  createdAt: string; // ISO timestamp
  /**
   * Stable student ID generated once (e.g. "STUDYOS-CBSE-PCM-A7K42").
   * Persisted so it never changes across refreshes. Backfilled for
   * profiles created before this field existed.
   */
  studentId: string;
};

/**
 * Generates a stable student ID: STUDYOS-{BOARD}-{STREAM}-{5-char code}.
 * Called ONCE (during onboarding or backfill), then persisted.
 * The 5-char code uses unambiguous characters (no 0/O, 1/I/L).
 */
export function generateStudentId(board: BoardId, stream: StreamId): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `STUDYOS-${board.toUpperCase()}-${stream.toUpperCase()}-${code}`;
}

/*
  The draft is the profile while it's still being filled in —
  every field may be missing until the student completes setup.
*/
export type OnboardingDraft = {
  board: BoardId | null;
  stream: StreamId | null;
  name: string;
  photoDataUrl: string | null;
};

export const EMPTY_DRAFT: OnboardingDraft = {
  board: null,
  stream: null,
  name: "",
  photoDataUrl: null,
};

/* ── Validation helpers ─────────────────────── */
export const MIN_NAME_LENGTH = 2;

export function isValidName(name: string): boolean {
  return name.trim().length >= MIN_NAME_LENGTH;
}

/* ── Lookup + guard helpers ─────────────────── */
export function getBoard(id: BoardId) {
  return BOARDS.find((board) => board.id === id)!;
}

export function getStream(id: StreamId) {
  return STREAMS.find((stream) => stream.id === id)!;
}

/*
  Type guards: localStorage holds plain JSON we can't trust blindly,
  so we verify values before using them.
*/
export function isBoardId(value: unknown): value is BoardId {
  return typeof value === "string" && BOARDS.some((b) => b.id === value);
}

export function isStreamId(value: unknown): value is StreamId {
  return typeof value === "string" && STREAMS.some((s) => s.id === value);
}

/* Convert a saved profile back into a draft (e.g. when editing setup). */
export function draftFromProfile(profile: StudentProfile): OnboardingDraft {
  return {
    board: profile.board,
    stream: profile.stream,
    name: profile.name,
    photoDataUrl: profile.photoDataUrl,
  };
}

/* Tidy up a name before saving: trim + collapse double spaces. */
export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}
