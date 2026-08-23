import Link from "next/link";
import { ArrowRight, Atom, FlaskConical, Sigma, type LucideIcon } from "lucide-react";
import type {
  PracticeSubjectKey,
  PracticeSummary,
} from "@/lib/practice/summary";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionTitle } from "@/components/dashboard/section-title";

/*
  Dashboard practice section: one compact card per practice
  subject the student has. Maths only appears for PCM/PCMB —
  the summary itself decides, so this component stays simple.

  Every number is computed from real completion data.
*/

const VISUALS: Record<
  PracticeSubjectKey,
  { icon: LucideIcon; tile: string; bar: string }
> = {
  mathematics: {
    icon: Sigma,
    tile: "bg-indigo-500/10 text-indigo-600",
    bar: "bg-indigo-500",
  },
  physics: { icon: Atom, tile: "bg-sky-500/10 text-sky-600", bar: "bg-sky-500" },
  chemistry: {
    icon: FlaskConical,
    tile: "bg-violet-500/10 text-violet-600",
    bar: "bg-violet-500",
  },
};

export function PracticeSummaryCard({ summary }: { summary: PracticeSummary }) {
  return (
    <section aria-labelledby="practice-heading">
      <div className="flex items-end justify-between gap-3">
        <SectionTitle
          id="practice-heading"
          title="Question Practice"
          description={`${summary.overall.completed} of ${summary.overall.total} questions practiced across your subjects.`}
        />
        <Link
          href="/practice"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-pine-600 transition-colors hover:text-pine-700"
        >
          Continue
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div
        className={`mt-5 grid gap-4 sm:grid-cols-2 ${
          summary.subjects.length > 2 ? "lg:grid-cols-3" : ""
        }`}
      >
        {summary.subjects.map((subject) => {
          const visual = VISUALS[subject.key];
          return (
            <Link
              key={subject.key}
              href={subject.href}
              className="rounded-2xl border border-line bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-30px_rgba(27,26,24,0.35)]"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-xl ${visual.tile}`}
                >
                  <visual.icon className="size-5" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold tracking-tight text-ink">
                    {subject.name}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {subject.stats.completed} / {subject.stats.total} ·{" "}
                    {subject.stats.percent}%
                  </p>
                </div>
              </div>
              <ProgressBar
                percent={subject.stats.percent}
                label={`${subject.name}: ${subject.stats.percent}%`}
                className="mt-4 h-1.5"
                barClassName={visual.bar}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
