import type { BoardId } from "@/lib/student";
import { SYLLABUS_REGISTRY } from "@/data/syllabus";
import {
  QUESTIONS_PER_SET,
  SETS_PER_CHAPTER,
  type PracticeChapter,
  type SubjectPractice,
} from "@/lib/practice/types";

/*
  ────────────────────────────────────────────────
  The Mathematics practice structure.

  It is DERIVED from the real Maths syllabus already in
  src/data/syllabus — so the practice chapters are always exactly
  the official chapters for that board, and can never drift out
  of sync with the syllabus.

  CBSE and RBSE are built separately from their own chapter
  lists; nothing is shared or copied between boards.

  Built once per board and cached: the structure is pure static
  data, so there's no reason to rebuild it on every render.
  ────────────────────────────────────────────────
*/

function buildChapter(
  board: BoardId,
  chapterId: string,
  title: string,
): PracticeChapter {
  return {
    chapterId,
    title,
    board,
    sets: Array.from({ length: SETS_PER_CHAPTER }, (_, setIndex) => {
      const setNumber = setIndex + 1;
      const setId = `${chapterId}-set${setNumber}`;
      return {
        id: setId,
        number: setNumber,
        chapterId,
        questions: Array.from({ length: QUESTIONS_PER_SET }, (_, qIndex) => {
          const number = qIndex + 1;
          return {
            /* zero-padded so ids sort naturally: q01 … q10 */
            id: `${setId}-q${String(number).padStart(2, "0")}`,
            number,
            setId,
            chapterId,
            board,
          };
        }),
      };
    }),
  };
}

const cache = new Map<BoardId, SubjectPractice>();

/** The full Maths practice structure for a board. */
export function getMathsPractice(board: BoardId): SubjectPractice {
  const cached = cache.get(board);
  if (cached) return cached;

  const mathsSyllabus = SYLLABUS_REGISTRY[board].mathematics;
  const practice: SubjectPractice = {
    board,
    chapters: mathsSyllabus.chapters.map((chapter) =>
      buildChapter(board, chapter.id, chapter.title),
    ),
  };

  cache.set(board, practice);
  return practice;
}

/** One chapter's practice, or undefined if the id isn't a Maths chapter. */
export function getPracticeChapter(
  board: BoardId,
  chapterId: string,
): PracticeChapter | undefined {
  return getMathsPractice(board).chapters.find(
    (chapter) => chapter.chapterId === chapterId,
  );
}
