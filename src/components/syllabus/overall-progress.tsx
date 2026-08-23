import type { ProgressStats } from "@/lib/syllabus/types";

/*
  The big "Overall Syllabus Progress" card:
  animated progress ring + live counts, all computed
  from real topic state (never hardcoded).
*/
const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function OverallProgress({ stats }: { stats: ProgressStats }) {
  const offset = CIRCUMFERENCE - (CIRCUMFERENCE * stats.percent) / 100;

  return (
    <section
      aria-label="Overall syllabus progress"
      className="rounded-3xl border border-line bg-surface p-6 sm:p-8"
    >
      <div className="flex flex-col items-center gap-7 sm:flex-row sm:gap-10">
        {/* ring */}
        <div className="relative shrink-0" aria-hidden>
          <svg viewBox="0 0 120 120" className="size-32 -rotate-90 sm:size-36">
            <circle
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              stroke="var(--color-line)"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              stroke="var(--color-pine-600)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              className="transition-[stroke-dashoffset] duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
                {stats.percent}%
              </p>
              <p className="text-xs font-medium text-ink-muted">completed</p>
            </div>
          </div>
        </div>

        {/* copy + counts */}
        <div className="w-full min-w-0">
          <h2 className="text-center font-display text-2xl font-medium tracking-tight text-ink sm:text-left">
            Overall Syllabus Progress
          </h2>
          <p className="mt-1 text-center text-sm text-ink-soft sm:text-left">
            Every topic you tick off moves this number — across all subjects.
          </p>

          <dl className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-pine-200 bg-pine-50 px-4 py-3 text-center sm:text-left">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-pine-700">
                Completed
              </dt>
              <dd className="mt-0.5 font-display text-2xl font-medium text-pine-700">
                {stats.completed}
              </dd>
            </div>
            <div className="rounded-2xl border border-line bg-canvas px-4 py-3 text-center sm:text-left">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Remaining
              </dt>
              <dd className="mt-0.5 font-display text-2xl font-medium text-ink">
                {stats.remaining}
              </dd>
            </div>
            <div className="rounded-2xl border border-line bg-canvas px-4 py-3 text-center sm:text-left">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Total
              </dt>
              <dd className="mt-0.5 font-display text-2xl font-medium text-ink">
                {stats.total}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
