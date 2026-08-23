import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import type { MarksSummary } from "@/lib/marks/summary";
import { calcPercentage, formatExamDate } from "@/lib/marks/results";
import { SectionTitle } from "@/components/dashboard/section-title";
import { ProgressBar } from "@/components/ui/progress-bar";

/*
  Dashboard "Academic Performance" card.
  Honest empty state when no results exist; real numbers otherwise.
*/
export function MarksSummaryCard({ summary }: { summary: MarksSummary }) {
  return (
    <section aria-labelledby="marks-heading">
      <SectionTitle
        id="marks-heading"
        title="Academic Performance"
        description={
          summary.hasResults
            ? `${summary.stats.tests} test${summary.stats.tests === 1 ? "" : "s"} recorded.`
            : "Record a test result to start tracking your scores."
        }
      />

      <div className="mt-5 rounded-3xl border border-line bg-surface p-6">
        {!summary.hasResults ? (
          <div className="flex flex-col items-center py-6 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-pine-50 text-pine-600">
              <TrendingUp className="size-6" strokeWidth={1.8} />
            </span>
            <p className="mt-3 font-semibold text-ink">0 Tests Recorded</p>
            <p className="mt-1 text-sm text-ink-soft">
              Add your first result to see your averages and trends here.
            </p>
            <Link
              href="/marks"
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-pine-600 px-5 text-sm font-medium text-white transition-colors hover:bg-pine-700"
            >
              Add Result
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-display text-4xl font-medium tracking-tight text-ink">
                  {summary.stats.tests}{" "}
                  <span className="text-base font-normal text-ink-muted">
                    test{summary.stats.tests === 1 ? "" : "s"}
                  </span>
                </p>
                <p className="mt-1 text-sm text-ink-soft">
                  {summary.stats.averagePercent}% average · {summary.stats.bestPercent}%
                  best
                </p>
              </div>
              <p className="font-display text-3xl font-medium text-pine-700">
                {summary.stats.averagePercent}%
              </p>
            </div>

            <ProgressBar
              percent={summary.stats.averagePercent}
              label={`Average performance: ${summary.stats.averagePercent}%`}
              className="mt-5"
            />

            {/* latest result */}
            {summary.latest && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line/70 pt-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Latest result
                  </p>
                  <p className="mt-0.5 truncate text-sm font-medium text-ink">
                    {summary.latest.subject} · {summary.latest.examType}
                    <span className="ml-1.5 text-ink-muted">
                      · {formatExamDate(summary.latest.examDate)}
                    </span>
                  </p>
                </div>
                <p className="shrink-0 font-display text-xl font-medium text-ink">
                  {calcPercentage(
                    summary.latest.marksObtained,
                    summary.latest.maximumMarks,
                  )}
                  %
                </p>
              </div>
            )}

            <Link
              href="/marks"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-pine-600 transition-colors hover:text-pine-700"
            >
              View all results
              <ArrowRight className="size-4" />
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
