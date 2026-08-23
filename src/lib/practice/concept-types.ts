import type { BoardId } from "@/lib/student";
import type { SubjectId } from "@/lib/subjects";

/*
  ────────────────────────────────────────────────
  Concept-based practice (Physics & Chemistry).

  Hierarchy:  Board → Subject → Chapter → Category → Question

  A "category" is a concept / formula group taken from the
  chapter's own official syllabus topics — e.g. "Ohm's Law",
  "Kirchhoff's Rules". The student always knows WHICH concept
  they are practicing, instead of a flat 1…30 list.

  This is intentionally a DIFFERENT shape from Mathematics
  practice (which uses 5 sets × 10 questions). Maths is
  untouched by this module.

  As with every other dataset in StudyOS, the structure is
  static application data; only completion lives in storage.
  ────────────────────────────────────────────────
*/

/** Questions per chapter, across all of its categories. */
export const QUESTIONS_PER_SCIENCE_CHAPTER = 30;

/**
 * How a chapter's practice is framed.
 * - "numerical": calculation-heavy chapter (most of Physics, and
 *   Solutions / Electrochemistry / Chemical Kinetics in Chemistry)
 * - "mixed": some calculation, largely conceptual
 * - "concept": no meaningful numericals — general practice questions.
 *   We never invent formulas for chapters that don't have them.
 */
export type PracticeMode = "numerical" | "mixed" | "concept";

export type ConceptQuestion = {
  /**
   * Stable id, e.g. "cbse-physics-ch3-ohms-law-q01".
   * Board + subject + chapter + category slug + number.
   * No array indexes, no display text — so reordering the UI or
   * rewording a category never loses a student's progress.
   */
  id: string;
  number: number;
  categoryId: string;
  chapterId: string;
  subjectId: SubjectId;
  board: BoardId;
  /*
    FUTURE QUESTION BANK: verified question content will be added
    as optional fields here (questionText, difficulty, …). Nothing
    else in the app needs to change when that happens.
  */
};

export type PracticeCategory = {
  /** e.g. "cbse-physics-ch3-ohms-law". */
  id: string;
  /** Stable slug within the chapter, e.g. "ohms-law". */
  key: string;
  /** Display name, taken from the chapter's official syllabus topics. */
  name: string;
  chapterId: string;
  questions: ConceptQuestion[];
};

export type ConceptChapter = {
  /** Same id as the syllabus chapter — the link between the two. */
  chapterId: string;
  title: string;
  board: BoardId;
  subjectId: SubjectId;
  mode: PracticeMode;
  categories: PracticeCategory[];
};

export type ConceptSubjectPractice = {
  board: BoardId;
  subjectId: SubjectId;
  chapters: ConceptChapter[];
};

/** questionId → "completed"; missing id means not attempted. */
export type ConceptProgress = Record<string, "completed">;

export type ConceptStats = {
  total: number;
  completed: number;
  remaining: number;
  percent: number;
};
