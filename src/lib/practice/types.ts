import type { BoardId } from "@/lib/student";

/*
  ────────────────────────────────────────────────
  Question-practice data model (Mathematics only, for now).

  Hierarchy:  Board → Mathematics → Chapter → Set → Question

  Every Maths chapter gets 5 sets × 10 questions = 50 slots.

  Like the syllabus, the STRUCTURE is static application data
  and the student's PROGRESS lives separately in localStorage.

  NOTE: these are practice *slots*, not question content. No
  actual Maths questions, answers or solutions exist yet.
  ────────────────────────────────────────────────
*/

export const SETS_PER_CHAPTER = 5;
export const QUESTIONS_PER_SET = 10;
export const QUESTIONS_PER_CHAPTER = SETS_PER_CHAPTER * QUESTIONS_PER_SET; // 50

export type PracticeQuestion = {
  /**
   * Stable id, e.g. "cbse-mathematics-ch3-set1-q01".
   * Derived from board + subject + chapter + set + question number —
   * never from array position at read time, and never from any
   * display text, so IDs survive UI and wording changes.
   */
  id: string;
  /** 1–10 within its set. */
  number: number;
  setId: string;
  chapterId: string;
  board: BoardId;
};

export type PracticeSet = {
  /** e.g. "cbse-mathematics-ch3-set1". */
  id: string;
  /** 1–5 within its chapter. */
  number: number;
  chapterId: string;
  questions: PracticeQuestion[];
};

export type PracticeChapter = {
  /** Same id as the syllabus chapter — this is the link between the two. */
  chapterId: string;
  title: string;
  board: BoardId;
  sets: PracticeSet[];
};

/** All Maths practice for one board. */
export type SubjectPractice = {
  board: BoardId;
  chapters: PracticeChapter[];
};

/*
  Maps questionId → "completed".
  Only completed questions are stored; a missing id means
  "not attempted". Keeps the saved payload small.
*/
export type QuestionProgress = Record<string, "completed">;

export type PracticeStats = {
  total: number;
  completed: number;
  remaining: number;
  percent: number; // 0–100, rounded
};
