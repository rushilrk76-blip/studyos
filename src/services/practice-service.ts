import {
  loadQuestionProgress,
  saveQuestionProgress,
  clearQuestionProgress,
} from "@/lib/practice-storage";
import {
  loadSciencePractice,
  saveSciencePractice,
  clearSciencePractice,
} from "@/lib/science-practice-storage";
import {
  withQuestionToggled,
  withSetToggled,
} from "@/lib/practice/progress";
import type { QuestionProgress } from "@/lib/practice/types";
import {
  withConceptQuestionToggled,
  withCategoryToggled,
} from "@/lib/practice/concept-progress";
import type { ConceptProgress } from "@/lib/practice/concept-types";

/*
  ────────────────────────────────────────────────
  Practice progress service — covers BOTH systems:

  1. Maths practice       (QuestionProgress — 5 sets × 10)
  2. Science practice     (ConceptProgress — Physics & Chemistry)

  Only completion state is stored. The question/category
  definitions remain static application data.

  FUTURE: methods become async when backed by Supabase
  (a `practice_completions` table keyed by questionId).
  ────────────────────────────────────────────────
*/

export const practiceService = {
  /* ── Maths ── */
  getMathsProgress(): QuestionProgress {
    return loadQuestionProgress();
  },

  saveMathsProgress(progress: QuestionProgress): void {
    saveQuestionProgress(progress);
  },

  toggleMathsQuestion(
    progress: QuestionProgress,
    questionId: string,
  ): QuestionProgress {
    return withQuestionToggled(progress, questionId);
  },

  toggleMathsSet(
    progress: QuestionProgress,
    set: Parameters<typeof withSetToggled>[1],
    completed: boolean,
  ): QuestionProgress {
    return withSetToggled(progress, set, completed);
  },

  /* ── Science (Physics & Chemistry) ── */
  getScienceProgress(): ConceptProgress {
    return loadSciencePractice();
  },

  saveScienceProgress(progress: ConceptProgress): void {
    saveSciencePractice(progress);
  },

  toggleScienceQuestion(
    progress: ConceptProgress,
    questionId: string,
  ): ConceptProgress {
    return withConceptQuestionToggled(progress, questionId);
  },

  toggleScienceCategory(
    progress: ConceptProgress,
    category: Parameters<typeof withCategoryToggled>[1],
    completed: boolean,
  ): ConceptProgress {
    return withCategoryToggled(progress, category, completed);
  },

  clearMathsProgress(): void {
    clearQuestionProgress();
  },

  clearScienceProgress(): void {
    clearSciencePractice();
  },
};
