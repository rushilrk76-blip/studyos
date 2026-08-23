import type { ExamResult } from "@/lib/marks/types";
import { calculateStats, calculateSubjectStats, sortByNewest } from "@/lib/marks/results";

/*
  ────────────────────────────────────────────────
  A single, reusable view-model for marks.

  Consumed by the dashboard today, and structured so the future
  Portfolio can read the same totals (tests, average, best,
  subject-wise performance, recent results) without new logic.
  ────────────────────────────────────────────────
*/

export type MarksSummary = {
  hasResults: boolean;
  stats: ReturnType<typeof calculateStats>;
  bySubject: ReturnType<typeof calculateSubjectStats>;
  latest: ExamResult | null;
};

export function buildMarksSummary(results: ExamResult[]): MarksSummary {
  const stats = calculateStats(results);
  return {
    hasResults: results.length > 0,
    stats,
    bySubject: calculateSubjectStats(results),
    latest: sortByNewest(results)[0] ?? null,
  };
}
