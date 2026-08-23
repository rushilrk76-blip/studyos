import {
  Award,
  BookOpenCheck,
  NotebookPen,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { DashboardData } from "@/lib/dashboard";

/*
  The four summary cards across the top of the dashboard.
  Every number is computed from real data — no hardcoded values.
*/
type CardSpec = {
  label: string;
  icon: LucideIcon;
  value: (data: DashboardData) => string;
  suffix?: string;
  sub: (data: DashboardData) => string;
};

const CARDS: CardSpec[] = [
  {
    label: "Syllabus Progress",
    icon: BookOpenCheck,
    value: (d) => `${d.stats.syllabusPercent}%`,
    suffix: "Completed",
    sub: (d) =>
      `${d.stats.topicsCompleted} completed · ${d.stats.topicsRemaining} remaining · ${d.stats.topicsTotal} total`,
  },
  {
    label: "Homework",
    icon: NotebookPen,
    value: (d) => `${d.stats.homework.pending}`,
    suffix: "Pending",
    sub: (d) =>
      d.stats.homework.total === 0
        ? "No homework added yet"
        : `${d.stats.homework.today} due today · ${d.stats.homework.completed} completed`,
  },
  {
    label: "Academic Marks",
    icon: TrendingUp,
    value: (d) =>
      d.marks.hasResults
        ? `${d.marks.stats.averagePercent}%`
        : "No marks yet",
    sub: (d) =>
      d.marks.hasResults
        ? `${d.marks.stats.tests} test${d.marks.stats.tests === 1 ? "" : "s"} · ${d.marks.stats.bestPercent}% best`
        : "Add your first test result",
  },
  {
    label: "Portfolio",
    icon: Award,
    value: () => "Profile Ready",
    sub: () => "Complete your academic profile",
  },
];

export function StatCards({ data }: { data: DashboardData }) {
  return (
    <section
      aria-label="Overview"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {CARDS.map((card) => (
        <article
          key={card.label}
          className="rounded-3xl border border-line bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-30px_rgba(27,26,24,0.35)] sm:p-6"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              {card.label}
            </p>
            <span className="grid size-9 place-items-center rounded-xl bg-pine-50 text-pine-600">
              <card.icon className="size-[18px]" strokeWidth={2} />
            </span>
          </div>
          <p className="mt-3 font-display text-[1.7rem] leading-8 tracking-tight text-ink">
            {card.value(data)}
            {card.suffix && (
              <span className="ml-1.5 align-middle text-sm font-normal text-ink-muted">
                {card.suffix}
              </span>
            )}
          </p>
          <p className="mt-1.5 text-sm text-ink-soft">{card.sub(data)}</p>
        </article>
      ))}
    </section>
  );
}
