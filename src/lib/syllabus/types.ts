import type { BoardId, StreamId } from "@/lib/student";
import type { SubjectId } from "@/lib/subjects";

/*
  ────────────────────────────────────────────────
  The syllabus data model.

  Hierarchy:  Board → Stream → Subject → Chapter → Topic

  - The SYLLABUS (topics that exist) is static application data
    under src/data/syllabus — the real CBSE / RBSE curriculum.
  - The PROGRESS (topics the student finished) belongs to the
    student and is stored separately in localStorage.

  Keeping them apart means the syllabus can be corrected or
  extended — and progress can later move to a database —
  without the two ever getting tangled.
  ────────────────────────────────────────────────
*/

/** The smallest trackable unit. Each one has its own checkbox. */
export type Topic = {
  /**
   * Stable id, e.g. "cbse-physics-ch1-t4".
   * Built from board + subject + chapter index + topic index —
   * deliberately NOT from the topic's display name, so rewording
   * a topic never loses a student's completed state.
   */
  id: string;
  name: string;
  chapterId: string;
  subjectId: SubjectId;
  board: BoardId;
};

export type Chapter = {
  id: string; // e.g. "cbse-physics-ch1"
  title: string;
  /** The official unit this chapter sits under, when the board defines one. */
  unit?: string;
  topics: Topic[];
};

export type SubjectSyllabus = {
  subjectId: SubjectId;
  chapters: Chapter[];
};

/** Everything a student of this board + stream needs to cover. */
export type Syllabus = {
  board: BoardId;
  stream: StreamId;
  subjects: SubjectSyllabus[];
};

/* ── Student-side progress ──────────────────── */
export type TopicStatus = "not-started" | "completed";

/*
  Maps topicId → "completed".
  Only completed topics are stored — an id missing from the
  record means "not-started". Keeps the saved payload tiny.
*/
export type TopicProgress = Record<string, "completed">;

/* ── Derived statistics ─────────────────────── */
export type ProgressStats = {
  total: number;
  completed: number;
  remaining: number;
  percent: number; // 0–100, rounded
};

/* Topic-list filters for the syllabus page. */
export type TopicFilter = "all" | "completed" | "not-started";
/** "all" = every subject in the student's stream, or a specific subject id. */
export type SubjectFilter = "all" | SubjectId;
