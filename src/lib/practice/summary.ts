import type { BoardId, StreamId } from "@/lib/student";
import { streamHasMaths } from "@/lib/subjects";
import { getMathsPractice } from "@/data/practice";
import { getSciencePractice } from "@/data/practice/science";
import { calculateOverallPractice } from "@/lib/practice/progress";
import { calculateSubjectPracticeProgress } from "@/lib/practice/concept-progress";
import type { ConceptProgress, ConceptStats } from "@/lib/practice/concept-types";
import type { QuestionProgress } from "@/lib/practice/types";

/*
  ────────────────────────────────────────────────
  One place that answers: "how much practice has this
  student done, per subject?"

  Used by the practice hub and the dashboard today, and ready
  for the Portfolio to consume later without any new maths:
  it already exposes Maths / Physics / Chemistry totals in a
  single, uniform shape.
  ────────────────────────────────────────────────
*/

export type PracticeSubjectKey = "mathematics" | "physics" | "chemistry";

export type PracticeSubjectSummary = {
  key: PracticeSubjectKey;
  name: string;
  /** Short description of what the practice contains. */
  blurb: string;
  href: string;
  stats: ConceptStats;
};

export type PracticeSummary = {
  subjects: PracticeSubjectSummary[];
  /** Combined across every practice subject the student has. */
  overall: ConceptStats;
};

export function buildPracticeSummary(
  board: BoardId,
  stream: StreamId,
  mathsProgress: QuestionProgress,
  scienceProgress: ConceptProgress,
): PracticeSummary {
  const subjects: PracticeSubjectSummary[] = [];

  /* Mathematics — only for streams that study it (PCM, PCMB). */
  if (streamHasMaths(stream)) {
    subjects.push({
      key: "mathematics",
      name: "Maths Practice",
      blurb: "5 sets × 10 questions per chapter",
      href: "/practice/maths",
      stats: calculateOverallPractice(getMathsPractice(board), mathsProgress),
    });
  }

  /* Physics & Chemistry — common to PCM, PCB and PCMB. */
  subjects.push({
    key: "physics",
    name: "Physics Numericals",
    blurb: "30 numericals per chapter, grouped by concept",
    href: "/practice/physics",
    stats: calculateSubjectPracticeProgress(
      getSciencePractice(board, "physics"),
      scienceProgress,
    ),
  });

  subjects.push({
    key: "chemistry",
    name: "Chemistry Practice",
    blurb: "30 questions per chapter, grouped by concept",
    href: "/practice/chemistry",
    stats: calculateSubjectPracticeProgress(
      getSciencePractice(board, "chemistry"),
      scienceProgress,
    ),
  });

  const total = subjects.reduce((sum, s) => sum + s.stats.total, 0);
  const completed = subjects.reduce((sum, s) => sum + s.stats.completed, 0);

  return {
    subjects,
    overall: {
      total,
      completed,
      remaining: total - completed,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    },
  };
}
