import type { PracticeMode } from "@/lib/practice/concept-types";

/*
  Honest labelling of how a chapter's practice is framed.
  Chemistry's organic/inorganic chapters are "Concept practice",
  not numericals — we never pretend otherwise.
*/
export const MODE_LABEL: Record<PracticeMode, string> = {
  numerical: "Numerical practice",
  mixed: "Mixed practice",
  concept: "Concept practice",
};
