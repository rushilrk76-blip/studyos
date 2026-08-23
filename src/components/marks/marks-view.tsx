"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Award,
  ChartNoAxesColumn,
  Plus,
  Search,
  SearchX,
  TrendingUp,
  X,
} from "lucide-react";
import {
  EXAM_TYPES,
  markSubjectsForStream,
  type ExamResult,
  type ExamType,
  type ResultDraft,
  type ResultFilter,
  type ResultSort,
} from "@/lib/marks/types";
import {
  calcPercentage,
  calculateStats,
  calculateSubjectStats,
  filterResults,
  formatExamDate,
  GRADE_LABEL,
  GRADE_STYLES,
  gradeForPercentage,
  sortResults,
  toChartData,
} from "@/lib/marks/results";
import { examService } from "@/services";
import { useStudent } from "@/components/app/student-context";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { ResultForm } from "@/components/marks/result-form";
import { ResultCard } from "@/components/marks/result-card";
import { PerformanceChart } from "@/components/marks/performance-chart";

/*
  ────────────────────────────────────────────────
  Marks & Performance page.

  Results are the student's own records, stored in their own
  localStorage key — completely independent of syllabus,
  practice and homework.
  ────────────────────────────────────────────────
*/

const SORTS: { id: ResultSort; label: string }[] = [
  { id: "latest", label: "Latest" },
  { id: "oldest", label: "Oldest" },
  { id: "highest", label: "Highest score" },
  { id: "lowest", label: "Lowest score" },
];

const TREND_LABEL = {
  improving: "Improving",
  stable: "Stable",
  declining: "Needs focus",
  none: "",
} as const;

export function MarksView() {
  const student = useStudent();
  const { toast } = useToast();
  const [results, setResults] = useState<ExamResult[] | null>(null);
  const [filter, setFilter] = useState<ResultFilter>({
    subject: "all",
    examType: "all",
    query: "",
  });
  const [sort, setSort] = useState<ResultSort>("latest");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExamResult | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setResults(examService.getResults());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (results) examService.saveResults(results);
  }, [results]);

  const subjects = useMemo(
    () =>
      student.status === "ready"
        ? markSubjectsForStream(student.profile.stream)
        : [],
    [student],
  );

  const stats = useMemo(
    () => calculateStats(results ?? []),
    [results],
  );
  const subjectStats = useMemo(
    () => calculateSubjectStats(results ?? []),
    [results],
  );

  const chartData = useMemo(() => {
    const list = results ?? [];
    const filteredBySubject =
      filter.subject === "all"
        ? list
        : list.filter((r) => r.subject === filter.subject);
    return toChartData(filteredBySubject);
  }, [results, filter.subject]);

  const visible = useMemo(() => {
    if (!results) return [];
    return sortResults(filterResults(results, filter), sort);
  }, [results, filter, sort]);

  if (student.status !== "ready" || !results) return <MarksSkeleton />;

  /* ── mutations ── */
  function handleSubmit(draft: ResultDraft) {
    setResults((current) => {
      const list = current ?? [];
      const obtained = Number(draft.marksObtained);
      const maximum = Number(draft.maximumMarks);

      if (editing) {
        /* Editing keeps the id; nothing else about identity changes. */
        return list.map((result) =>
          result.id === editing.id
            ? {
                ...result,
                examName: draft.examName,
                examType: draft.examType,
                subject: draft.subject,
                marksObtained: obtained,
                maximumMarks: maximum,
                examDate: draft.examDate,
                notes: draft.notes,
              }
            : result,
        );
      }

      const result: ExamResult = {
        id: examService.createId(),
        examName: draft.examName,
        examType: draft.examType,
        subject: draft.subject,
        marksObtained: obtained,
        maximumMarks: maximum,
        examDate: draft.examDate,
        notes: draft.notes,
        createdAt: new Date().toISOString(),
      };
      return [result, ...list];
    });
    setFormOpen(false);
    setEditing(null);
    toast(editing ? "Result updated." : "Result saved.");
  }

  function deleteResult(id: string) {
    setResults((current) => (current ?? []).filter((result) => result.id !== id));
    toast("Result deleted.");
  }

  const hasResults = results.length > 0;
  const latest = visible[0];
  const isFiltering =
    filter.subject !== "all" ||
    filter.examType !== "all" ||
    filter.query.trim() !== "";

  return (
    <div className="space-y-7">
      {/* header */}
      <PageHeader
        title="Marks & Performance"
        description="Track your test scores and understand your academic progress."
        action={
          <Button
            size="lg"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Add Result
          </Button>
        }
      />

      {/* empty state */}
      {!hasResults ? (
        <EmptyState onAdd={() => setFormOpen(true)} />
      ) : (
        <>
          {/* summary cards */}
          <Reveal delay={50}>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <SummaryCard
                icon={<ChartNoAxesColumn className="size-[18px]" />}
                label="Tests Recorded"
                value={String(stats.tests)}
              />
              <SummaryCard
                icon={<TrendingUp className="size-[18px]" />}
                label="Average"
                value={`${stats.averagePercent}%`}
                accent="text-pine-700"
              />
              <SummaryCard
                icon={<Award className="size-[18px]" />}
                label="Best Score"
                value={`${stats.bestPercent}%`}
                accent="text-sky-600"
              />
              <SummaryCard
                icon={<ChartNoAxesColumn className="size-[18px]" />}
                label="Latest Score"
                value={stats.latestPercent !== null ? `${stats.latestPercent}%` : "—"}
              />
            </div>
          </Reveal>

          {/* trend + chart */}
          <Reveal delay={80}>
            <section
              aria-label="Performance over time"
              className="rounded-3xl border border-line bg-surface p-5 sm:p-6"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-ink">
                  Performance Over Time
                </h2>
                {stats.trend !== "none" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs font-medium text-ink-soft">
                    <span
                      className={`size-1.5 rounded-full ${
                        stats.trend === "improving"
                          ? "bg-pine-600"
                          : stats.trend === "declining"
                            ? "bg-ember"
                            : "bg-ink-muted"
                      }`}
                      aria-hidden
                    />
                    {TREND_LABEL[stats.trend]}
                  </span>
                )}
              </div>
              {chartData.length > 0 ? (
                <PerformanceChart points={chartData} />
              ) : (
                <p className="py-8 text-center text-sm text-ink-muted">
                  No results match the current subject filter.
                </p>
              )}
            </section>
          </Reveal>

          {/* subject performance */}
          {subjectStats.length > 0 && (
            <Reveal delay={110}>
              <section aria-labelledby="subject-perf-heading">
                <h2
                  id="subject-perf-heading"
                  className="text-lg font-semibold tracking-tight text-ink"
                >
                  Subject Performance
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {subjectStats.map((subject) => (
                    <div
                      key={subject.subject}
                      className="rounded-2xl border border-line bg-surface p-4"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate font-semibold text-ink">
                          {subject.subject}
                        </p>
                        <p className="text-xs text-ink-muted">
                          {subject.tests} test{subject.tests === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="mt-3 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                            Average
                          </p>
                          <p className="font-display text-2xl font-medium text-ink">
                            {subject.averagePercent}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                            Best
                          </p>
                          <p className="font-display text-2xl font-medium text-pine-700">
                            {subject.bestPercent}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          {/* filters + search */}
          <Reveal delay={140}>
            <div className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
                  <input
                    type="search"
                    value={filter.query}
                    onChange={(e) =>
                      setFilter({ ...filter, query: e.target.value })
                    }
                    placeholder="Search exam name…"
                    aria-label="Search results"
                    className="h-11 w-full rounded-full border border-line bg-surface pl-11 pr-10 text-sm text-ink placeholder:text-ink-muted/70 transition-colors focus:border-pine-600 focus:outline-none focus:ring-2 focus:ring-pine-600/20"
                  />
                  {filter.query && (
                    <button
                      type="button"
                      onClick={() => setFilter({ ...filter, query: "" })}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="result-sort" className="sr-only">
                    Sort results
                  </label>
                  <select
                    id="result-sort"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as ResultSort)}
                    className="h-11 rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors focus:border-pine-600 focus:outline-none"
                  >
                    {SORTS.map((option) => (
                      <option key={option.id} value={option.id}>
                        Sort: {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                role="group"
                aria-label="Filter by exam type"
                className="flex flex-wrap gap-2"
              >
                <Chip
                  label="All types"
                  active={filter.examType === "all"}
                  onClick={() => setFilter({ ...filter, examType: "all" })}
                />
                {EXAM_TYPES.map((type) => (
                  <Chip
                    key={type}
                    label={type}
                    active={filter.examType === type}
                    onClick={() => setFilter({ ...filter, examType: type })}
                  />
                ))}
              </div>

              <div
                role="group"
                aria-label="Filter by subject"
                className="flex flex-wrap gap-2"
              >
                <Chip
                  label="All subjects"
                  active={filter.subject === "all"}
                  onClick={() => setFilter({ ...filter, subject: "all" })}
                />
                {subjects.map((subject) => (
                  <Chip
                    key={subject}
                    label={subject}
                    active={filter.subject === subject}
                    onClick={() => setFilter({ ...filter, subject })}
                  />
                ))}
              </div>
            </div>
          </Reveal>

          {/* results list */}
          {visible.length === 0 ? (
            <div className="rounded-3xl border border-line bg-surface px-6 py-14 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-canvas text-ink-muted">
                <SearchX className="size-6" strokeWidth={1.9} />
              </span>
              <p className="mt-4 font-semibold text-ink">No results match</p>
              <p className="mt-1 text-sm text-ink-soft">
                Try a different search or clear your filters.
              </p>
              {isFiltering && (
                <Button
                  variant="secondary"
                  className="mt-5"
                  onClick={() =>
                    setFilter({ subject: "all", examType: "all", query: "" })
                  }
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {visible.map((result) => {
                const percent = calcPercentage(
                  result.marksObtained,
                  result.maximumMarks,
                );
                const style = GRADE_STYLES[gradeForPercentage(percent)];
                return (
                  <div key={result.id}>
                    {/* small latest tag on the newest visible result */}
                    {result.id === latest?.id && (
                      <p className="mb-1.5 ml-1 text-xs font-medium text-ink-muted">
                        Latest
                      </p>
                    )}
                    <ResultCard
                      result={result}
                      onEdit={() => {
                        setEditing(result);
                        setFormOpen(true);
                      }}
                      onDelete={() => deleteResult(result.id)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {formOpen && (
        <ResultForm
          subjects={subjects}
          editing={editing}
          onSubmit={handleSubmit}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

/* ── small pieces ── */

function SummaryCard({
  icon,
  label,
  value,
  accent = "text-ink",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          {label}
        </p>
        <span className="text-pine-600">{icon}</span>
      </div>
      <p className={`mt-2 font-display text-2xl font-medium ${accent}`}>
        {value}
      </p>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-9 rounded-full border px-3.5 text-[13px] font-medium transition-colors ${
        active
          ? "border-pine-600 bg-pine-50 text-pine-700"
          : "border-line bg-surface text-ink-soft hover:border-ink/25 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-3xl border border-line bg-surface px-6 py-16 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-pine-50 text-pine-600">
        <TrendingUp className="size-7" strokeWidth={1.8} />
      </span>
      <p className="mt-5 font-display text-2xl font-medium tracking-tight text-ink">
        No test results yet
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
        Add your first result to start tracking your progress.
      </p>
      <Button size="lg" className="mt-6" onClick={onAdd}>
        <Plus className="size-4" />
        Add Result
      </Button>
    </div>
  );
}

function MarksSkeleton() {
  return (
    <div className="space-y-7" aria-hidden>
      <span className="block h-10 w-72 max-w-full animate-pulse rounded-lg bg-line" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-24 animate-pulse rounded-2xl border border-line bg-surface"
          />
        ))}
      </div>
      <span className="block h-64 animate-pulse rounded-3xl border border-line bg-surface" />
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block h-28 animate-pulse rounded-2xl border border-line bg-surface"
        />
      ))}
    </div>
  );
}
