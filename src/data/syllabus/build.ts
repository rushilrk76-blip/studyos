import type { BoardId } from "@/lib/student";
import type { SubjectId } from "@/lib/subjects";
import type { SubjectSyllabus } from "@/lib/syllabus/types";

/*
  ────────────────────────────────────────────────
  Authoring helper for syllabus data files.

  Data files stay readable — a chapter title plus a list of
  topic names — while this helper generates the STABLE IDs:

      cbse-physics-ch1-t4

  IDs are built from board + subject + chapter index + topic
  index. They deliberately do NOT contain the topic's text, so
  fixing a typo or rewording a topic never loses a student's
  completed state.

  ⚠️ Never reorder or delete entries in an existing chapter —
  that would shift indexes and therefore shift IDs. Add new
  topics at the end of the chapter instead.
  ────────────────────────────────────────────────
*/

export type ChapterInput = {
  /** Chapter title exactly as it appears in the official syllabus. */
  title: string;
  /** Optional official unit this chapter belongs to (e.g. "Unit I: Electrostatics"). */
  unit?: string;
  /** Individual topics, in official order. */
  topics: string[];
};

export function defineSubject(
  board: BoardId,
  subjectId: SubjectId,
  chapters: ChapterInput[],
): SubjectSyllabus {
  return {
    subjectId,
    chapters: chapters.map((chapter, chapterIndex) => {
      const chapterNo = chapterIndex + 1;
      const chapterId = `${board}-${subjectId}-ch${chapterNo}`;
      return {
        id: chapterId,
        title: chapter.title,
        unit: chapter.unit,
        topics: chapter.topics.map((name, topicIndex) => ({
          id: `${chapterId}-t${topicIndex + 1}`,
          name,
          chapterId,
          subjectId,
          board,
        })),
      };
    }),
  };
}
