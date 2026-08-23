import type {
  ExamResult,
  PerformanceGrade,
  PerformanceTrend,
  ResultFilter,
  ResultSort,
  ResultStats,
  SubjectStats,
} from "@/lib/marks/types";
import { EXAM_TYPES, type ExamType } from "@/lib/marks/types";

/*
  ────────────────────────────────────────────────
  All marks calculations live here.

  Percentage is always DERIVED from marksObtained /
  maximumMarks — never read from storage. Stats are pure
  functions shared by the Marks page AND the dashboard, so the
  same result counts the same way everywhere.
  ────────────────────────────────────────────────
*/

/** Percentage from raw marks, rounded to the nearest whole. */
export function calcPercentage(obtained: number, maximum: number): number {
  if (maximum <= 0) return 0;
  return Math.round((obtained / maximum) * 100);
}

export function gradeForPercentage(percent: number): PerformanceGrade {
  if (percent >= 90) return "excellent";
  if (percent >= 75) return "good";
  if (percent >= 60) return "needs-improvement";
  return "focus-needed";
}

export const GRADE_LABEL: Record<PerformanceGrade, string> = {
  excellent: "Excellent",
  good: "Good",
  "needs-improvement": "Needs Improvement",
  "focus-needed": "Focus Needed",
};

export const GRADE_STYLES: Record<
  PerformanceGrade,
  { chip: string; text: string }
> = {
  excellent: { chip: "bg-pine-50 text-pine-700", text: "text-pine-700" },
  good: { chip: "bg-sky-500/10 text-sky-600", text: "text-sky-600" },
  "needs-improvement": {
    chip: "bg-sun-400/15 text-sun-500",
    text: "text-sun-500",
  },
  "focus-needed": { chip: "bg-ember/10 text-ember", text: "text-ember" },
};

/** "20 Aug 2026" style for display. */
export function formatExamDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return dateKey;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

/* ── Ordering & chronological helpers ────────── */
function chronological(a: ExamResult, b: ExamResult): number {
  const byDate = a.examDate.localeCompare(b.examDate);
  if (byDate !== 0) return byDate;
  return a.createdAt.localeCompare(b.createdAt);
}

function newestFirst(a: ExamResult, b: ExamResult): number {
  return -chronological(a, b);
}

/** Newest-first — useful for "latest result" lookups. */
export function sortByNewest(results: ExamResult[]): ExamResult[] {
  return [...results].sort(newestFirst);
}

export function sortResults(
  results: ExamResult[],
  sort: ResultSort,
): ExamResult[] {
  const list = [...results];
  switch (sort) {
    case "latest":
      return list.sort(newestFirst);
    case "oldest":
      return list.sort(chronological);
    case "highest":
      return list.sort(
        (a, b) =>
          calcPercentage(b.marksObtained, b.maximumMarks) -
          calcPercentage(a.marksObtained, a.maximumMarks),
      );
    case "lowest":
      return list.sort(
        (a, b) =>
          calcPercentage(a.marksObtained, a.maximumMarks) -
          calcPercentage(b.marksObtained, b.maximumMarks),
      );
  }
}

export function filterResults(
  results: ExamResult[],
  filter: ResultFilter,
): ExamResult[] {
  const q = filter.query.trim().toLowerCase();
  return results.filter((result) => {
    if (filter.subject !== "all" && result.subject !== filter.subject)
      return false;
    if (filter.examType !== "all" && result.examType !== filter.examType)
      return false;
    if (
      q &&
      !result.examName.toLowerCase().includes(q) &&
      !result.subject.toLowerCase().includes(q) &&
      !result.examType.toLowerCase().includes(q)
    )
      return false;
    return true;
  });
}

/* ── Trend ───────────────────────────────────── */
/*
  Compares the average of the latest third of tests against the
  earliest third. Meaningful only with enough results — a single
  test shows "none" rather than a strong conclusion.
*/
export function calculateTrend(results: ExamResult[]): PerformanceTrend {
  const ordered = [...results].sort(chronological);
  if (ordered.length < 3) return "none";

  const third = Math.max(1, Math.floor(ordered.length / 3));
  const recent = ordered.slice(-third);
  const earlier = ordered.slice(0, third);

  const avg = (group: ExamResult[]): number =>
    group.reduce(
      (sum, r) => sum + calcPercentage(r.marksObtained, r.maximumMarks),
      0,
    ) / group.length;

  const delta = avg(recent) - avg(earlier);
  if (delta >= 4) return "improving";
  if (delta <= -4) return "declining";
  return "stable";
}

/* ── Aggregate statistics ────────────────────── */
export function calculateStats(results: ExamResult[]): ResultStats {
  const tests = results.length;
  if (tests === 0) {
    return {
      tests: 0,
      averagePercent: 0,
      bestPercent: 0,
      latestPercent: null,
      trend: "none",
    };
  }

  const percents = results.map((r) =>
    calcPercentage(r.marksObtained, r.maximumMarks),
  );
  const ordered = [...results].sort(chronological);
  const latest = ordered[ordered.length - 1];

  return {
    tests,
    averagePercent: Math.round(
      percents.reduce((sum, p) => sum + p, 0) / percents.length,
    ),
    bestPercent: Math.max(...percents),
    latestPercent: calcPercentage(latest.marksObtained, latest.maximumMarks),
    trend: calculateTrend(results),
  };
}

/** Per-subject stats, sorted by most tests then best score. */
export function calculateSubjectStats(results: ExamResult[]): SubjectStats[] {
  const grouped = new Map<string, ExamResult[]>();
  for (const result of results) {
    const group = grouped.get(result.subject) ?? [];
    group.push(result);
    grouped.set(result.subject, group);
  }

  const stats = [...grouped.entries()].map(([subject, group]) => {
    const overall = calculateStats(group);
    return {
      subject,
      tests: overall.tests,
      averagePercent: overall.averagePercent,
      bestPercent: overall.bestPercent,
      latestPercent: overall.latestPercent,
    };
  });

  return stats.sort((a, b) => {
    if (b.tests !== a.tests) return b.tests - a.tests;
    return b.bestPercent - a.bestPercent;
  });
}

/* ── Chart data ─────────────────────────────── */
export type ChartPoint = {
  result: ExamResult;
  percent: number;
};

/** Chronological points for the performance line chart. */
export function toChartData(results: ExamResult[]): ChartPoint[] {
  return [...results]
    .sort(chronological)
    .map((result) => ({
      result,
      percent: calcPercentage(result.marksObtained, result.maximumMarks),
    }));
}

/** Used to validate stored/edited exam-type strings. */
export function isExamType(value: unknown): value is ExamType {
  return (
    typeof value === "string" &&
    (EXAM_TYPES as readonly string[]).includes(value)
  );
}
