import type { BoardId } from "@/lib/student";
import type { ConceptSubjectPractice } from "@/lib/practice/concept-types";
import { cbsePhysicsPractice } from "@/data/practice/physics/cbse";
import { rbsePhysicsPractice } from "@/data/practice/physics/rbse";
import { cbseChemistryPractice } from "@/data/practice/chemistry/cbse";
import { rbseChemistryPractice } from "@/data/practice/chemistry/rbse";

export { PRACTICE_DATA_ISSUES } from "@/data/practice/build-concept";

/*
  Registry for concept-based (Physics / Chemistry) practice.
  CBSE and RBSE are entirely separate datasets.

  Static application data — imported once, never re-derived.
*/
export type SciencePracticeSubject = "physics" | "chemistry";

const REGISTRY: Record<
  BoardId,
  Record<SciencePracticeSubject, ConceptSubjectPractice>
> = {
  cbse: { physics: cbsePhysicsPractice, chemistry: cbseChemistryPractice },
  rbse: { physics: rbsePhysicsPractice, chemistry: rbseChemistryPractice },
};

export function getSciencePractice(
  board: BoardId,
  subject: SciencePracticeSubject,
): ConceptSubjectPractice {
  return REGISTRY[board][subject];
}

export function getScienceChapter(
  board: BoardId,
  subject: SciencePracticeSubject,
  chapterId: string,
) {
  return getSciencePractice(board, subject).chapters.find(
    (chapter) => chapter.chapterId === chapterId,
  );
}

export const SCIENCE_PRACTICE_REGISTRY = REGISTRY;
