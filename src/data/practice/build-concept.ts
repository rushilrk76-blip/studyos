import type { BoardId } from "@/lib/student";
import type { SubjectId } from "@/lib/subjects";
import { SYLLABUS_REGISTRY } from "@/data/syllabus";
import {
  QUESTIONS_PER_SCIENCE_CHAPTER,
  type ConceptChapter,
  type ConceptSubjectPractice,
  type PracticeMode,
} from "@/lib/practice/concept-types";

/*
  ────────────────────────────────────────────────
  Authoring helper for Physics / Chemistry practice data.

  Data files declare only:
    chapterId + mode + categories [{ key, name, count }]

  This helper:
  - looks the chapter TITLE up from the real syllabus, so titles
    can never drift out of sync with the curriculum data
  - generates stable ids for categories and questions
  - records (rather than hides) any data problem: a chapter id
    that isn't in the syllabus, or counts that don't add to 30

  Problems are collected in PRACTICE_DATA_ISSUES and reported by
  scripts/audit-science-practice.ts — never silently ignored.
  ────────────────────────────────────────────────
*/

export type CategoryInput = {
  /** Stable slug — never change it once shipped. */
  key: string;
  /** Concept / formula name, from the chapter's official topics. */
  name: string;
  /** How many of the chapter's 30 questions belong to this concept. */
  count: number;
};

export type ChapterInput = {
  /** Must match a chapter id in the syllabus dataset. */
  chapterId: string;
  mode: PracticeMode;
  categories: CategoryInput[];
};

export const PRACTICE_DATA_ISSUES: string[] = [];

export function defineConceptPractice(
  board: BoardId,
  subjectId: SubjectId,
  chapters: ChapterInput[],
): ConceptSubjectPractice {
  const syllabusChapters = SYLLABUS_REGISTRY[board][subjectId].chapters;
  const titleById = new Map(syllabusChapters.map((c) => [c.id, c.title]));

  const built: ConceptChapter[] = chapters.map((chapter) => {
    const title = titleById.get(chapter.chapterId);
    if (!title) {
      PRACTICE_DATA_ISSUES.push(
        `${board}/${subjectId}: "${chapter.chapterId}" is not a chapter in the syllabus dataset.`,
      );
    }

    const total = chapter.categories.reduce((sum, c) => sum + c.count, 0);
    if (total !== QUESTIONS_PER_SCIENCE_CHAPTER) {
      PRACTICE_DATA_ISSUES.push(
        `${board}/${subjectId}/${chapter.chapterId}: categories total ${total}, expected ${QUESTIONS_PER_SCIENCE_CHAPTER}.`,
      );
    }

    const keys = new Set(chapter.categories.map((c) => c.key));
    if (keys.size !== chapter.categories.length) {
      PRACTICE_DATA_ISSUES.push(
        `${board}/${subjectId}/${chapter.chapterId}: duplicate category keys.`,
      );
    }

    return {
      chapterId: chapter.chapterId,
      title: title ?? chapter.chapterId,
      board,
      subjectId,
      mode: chapter.mode,
      categories: chapter.categories.map((category) => {
        const categoryId = `${chapter.chapterId}-${category.key}`;
        return {
          id: categoryId,
          key: category.key,
          name: category.name,
          chapterId: chapter.chapterId,
          questions: Array.from({ length: category.count }, (_, index) => {
            const number = index + 1;
            return {
              id: `${categoryId}-q${String(number).padStart(2, "0")}`,
              number,
              categoryId,
              chapterId: chapter.chapterId,
              subjectId,
              board,
            };
          }),
        };
      }),
    };
  });

  /* Any syllabus chapter with no practice entry at all? */
  const covered = new Set(chapters.map((c) => c.chapterId));
  for (const chapter of syllabusChapters) {
    if (!covered.has(chapter.id)) {
      PRACTICE_DATA_ISSUES.push(
        `${board}/${subjectId}: syllabus chapter "${chapter.id}" (${chapter.title}) has NO practice structure.`,
      );
    }
  }

  return { board, subjectId, chapters: built };
}
