import type {
  ConceptChapter,
  ConceptProgress,
  ConceptStats,
  ConceptSubjectPractice,
  PracticeCategory,
} from "@/lib/practice/concept-types";

/*
  ────────────────────────────────────────────────
  Progress flows upward through one set of pure functions:

    question → category → chapter → subject → overall

  Nothing is hardcoded, and these functions are shared by the
  practice pages AND the dashboard, so the same question is
  always worth the same amount everywhere.

  Completely independent of syllabus progress and homework.
  ────────────────────────────────────────────────
*/

function statsFrom(total: number, completed: number): ConceptStats {
  return {
    total,
    completed,
    remaining: total - completed,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function isQuestionDone(
  questionId: string,
  progress: ConceptProgress,
): boolean {
  return progress[questionId] === "completed";
}

/** Progress for one concept / formula category. */
export function calculatePracticeProgress(
  category: PracticeCategory,
  progress: ConceptProgress,
): ConceptStats {
  const completed = category.questions.reduce(
    (count, question) => count + (isQuestionDone(question.id, progress) ? 1 : 0),
    0,
  );
  return statsFrom(category.questions.length, completed);
}

export function calculateChapterPracticeProgress(
  chapter: ConceptChapter,
  progress: ConceptProgress,
): ConceptStats {
  let total = 0;
  let completed = 0;
  for (const category of chapter.categories) {
    const stats = calculatePracticeProgress(category, progress);
    total += stats.total;
    completed += stats.completed;
  }
  return statsFrom(total, completed);
}

export function calculateSubjectPracticeProgress(
  subject: ConceptSubjectPractice,
  progress: ConceptProgress,
): ConceptStats {
  let total = 0;
  let completed = 0;
  for (const chapter of subject.chapters) {
    const stats = calculateChapterPracticeProgress(chapter, progress);
    total += stats.total;
    completed += stats.completed;
  }
  return statsFrom(total, completed);
}

/** Returns a NEW progress record with one question flipped. */
export function withConceptQuestionToggled(
  progress: ConceptProgress,
  questionId: string,
): ConceptProgress {
  const next = { ...progress };
  if (next[questionId] === "completed") delete next[questionId];
  else next[questionId] = "completed";
  return next;
}

/** Marks every question in a category done, or clears them all. */
export function withCategoryToggled(
  progress: ConceptProgress,
  category: PracticeCategory,
  completed: boolean,
): ConceptProgress {
  const next = { ...progress };
  for (const question of category.questions) {
    if (completed) next[question.id] = "completed";
    else delete next[question.id];
  }
  return next;
}
