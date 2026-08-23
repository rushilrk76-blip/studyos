import type { DashboardData } from "@/lib/dashboard";
import { Reveal } from "@/components/ui/reveal";
import { ProgressBar } from "@/components/ui/progress-bar";

/*
  The prominent "Your Progress" hero at the top — animated
  ring + live counts from syllabus data.
*/
const RADIUS = 54;
const CIRC = 2 * Math.PI * RADIUS;

export function ProgressHero({ data }: { data: DashboardData }) {
  const offset = CIRC - (CIRC * data.stats.syllabusPercent) / 100;

  return (
    <Reveal>
      <section className="overflow-hidden rounded-3xl border border-line bg-surface">
        <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:gap-8 sm:p-8">
          {/* ring */}
          <div className="relative shrink-0" aria-hidden>
            <svg viewBox="0 0 128 128" className="size-28 -rotate-90 sm:size-32">
              <circle cx="64" cy="64" r={RADIUS} fill="none" stroke="var(--color-line)" strokeWidth="10" />
              <circle
                cx="64" cy="64" r={RADIUS} fill="none"
                stroke="var(--color-pine-600)" strokeWidth="10" strokeLinecap="round"
                strokeDasharray={CIRC} strokeDashoffset={offset}
                className="transition-[stroke-dashoffset] duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <p className="font-display text-3xl font-medium text-ink">{data.stats.syllabusPercent}%</p>
            </div>
          </div>

          {/* copy + counts */}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Your Progress</p>
            <h2 className="mt-1 font-display text-xl font-medium text-ink">Overall Syllabus Completion</h2>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Count label="Completed" value={data.stats.topicsCompleted} accent="text-pine-700" />
              <Count label="Remaining" value={data.stats.topicsRemaining} />
              <Count label="Total" value={data.stats.topicsTotal} />
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

function Count({ label, value, accent = "text-ink" }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-xl border border-line bg-canvas/50 px-3 py-2 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{label}</p>
      <p className={`mt-0.5 font-display text-xl font-medium ${accent}`}>{value}</p>
    </div>
  );
}
