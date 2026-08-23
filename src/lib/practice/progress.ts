import type {
  PracticeChapter,
  PracticeSet,
  PracticeStats,
  QuestionProgress,
  SubjectPractice,
} from "@/lib/practice/types";

/*
  ────────────────────────────────────────────────
  All practice numbers are computed HERE.

  Question → Set → Chapter → Overall, from one small set of
  pure functions, so a question is always worth the same
  amount wherever it's displayed (practice page, dashboard…).

  These are deliberately SEPARATE from the syllabus progress
  functions: theory progress and practice progress are two
  independent systems and must never affect each other.
  ────────────────────────────────────────────────
*/

export function isQuestionCompleted(
  questionId: string,
  progress: QuestionProgress,
): boolean {
  return progress[questionId] === "completed";
}

function statsFrom(total: number, completed: number): PracticeStats {
  return {
    total,
    completed,
    remaining: total - completed,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function calculateSetProgress(
  set: PracticeSet,
  progress: QuestionProgress,
): PracticeStats {
  const completed = set.questions.reduce(
    (count, question) =>
      count + (isQuestionCompleted(question.id, progress) ? 1 : 0),
    0,
  );
  return statsFrom(set.questions.length, completed);
}

export function calculateChapterPractice(
  chapter: PracticeChapter,
  progress: QuestionProgress,
): PracticeStats {
  let total = 0;
  let completed = 0;
  for (const set of chapter.sets) {
    const stats = calculateSetProgress(set, progress);
    total += stats.total;
    completed += stats.completed;
  }
  return statsFrom(total, completed);
}

export function calculateOverallPractice(
  practice: SubjectPractice,
  progress: QuestionProgress,
): PracticeStats {
  let total = 0;
  let completed = 0;
  for (const chapter of practice.chapters) {
    const stats = calculateChapterPractice(chapter, progress);
    total += stats.total;
    completed += stats.completed;
  }
  return statsFrom(total, completed);
}

/** Returns a NEW progress record with one question flipped. */
export function withQuestionToggled(
  progress: QuestionProgress,
  questionId: string,
): QuestionProgress {
  const next = { ...progress };
  if (next[questionId] === "completed") {
    delete next[questionId];
  } else {
    next[questionId] = "completed";
  }
  return next;
}

/** Marks every question in a set completed, or clears them all. */
export function withSetToggled(
  progress: QuestionProgress,
  set: PracticeSet,
  completed: boolean,
): QuestionProgress {
  const next = { ...progress };
  for (const question of set.questions) {
    if (completed) next[question.id] = "completed";
    else delete next[question.id];
  }
  return next;
}
