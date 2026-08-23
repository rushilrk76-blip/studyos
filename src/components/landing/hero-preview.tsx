import {
  CheckCircle2,
  Circle,
  CircleDot,
  NotebookPen,
  TrendingUp,
} from "lucide-react";

/*
  A static, purely-presentational illustration of the product.
  The numbers below are hand-written examples — NOT real data.
  When the syllabus & marks features are built, the real app
  will show live data instead of a landing-page illustration.
*/

const topics = [
  { name: "Electrostatics", state: "done" },
  { name: "Current Electricity", state: "done" },
  { name: "Magnetism & Matter", state: "active" },
  { name: "Ray Optics", state: "pending" },
] as const;

const recentScores = [62, 74, 70, 82, 88];

function TopicIcon({ state }: { state: (typeof topics)[number]["state"] }) {
  if (state === "done")
    return <CheckCircle2 className="size-4.5 shrink-0 text-pine-600" />;
  if (state === "active")
    return <CircleDot className="size-4.5 shrink-0 text-sun-500" />;
  return <Circle className="size-4.5 shrink-0 text-line" />;
}

export function HeroPreview() {
  return (
    <div className="relative mx-auto max-w-md lg:max-w-none">
      {/* Main card: syllabus progress */}
      <div className="relative rotate-[1.5deg] rounded-3xl border border-line bg-surface p-6 shadow-[0_30px_70px_-30px_rgba(27,26,24,0.3)]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
              Physics · Class 12
            </p>
            <p className="mt-1.5 font-display text-3xl font-medium text-ink">
              68%
              <span className="ml-2 align-middle text-sm font-normal text-ink-muted">
                completed
              </span>
            </p>
          </div>
          <span className="rounded-full bg-pine-50 px-3 py-1 text-xs font-semibold text-pine-700">
            On track
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-pine-100">
          <div className="h-full w-[68%] rounded-full bg-pine-600" />
        </div>

        {/* Topic checklist */}
        <ul className="mt-5 space-y-3">
          {topics.map((topic) => (
            <li key={topic.name} className="flex items-center gap-3">
              <TopicIcon state={topic.state} />
              <span
                className={`text-sm ${
                  topic.state === "done"
                    ? "text-ink-muted line-through decoration-line"
                    : topic.state === "active"
                      ? "font-medium text-ink"
                      : "text-ink-muted"
                }`}
              >
                {topic.name}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Floating card: homework */}
      <div className="absolute -right-3 -top-8 hidden w-56 animate-float rounded-2xl border border-line bg-surface p-4 shadow-[0_20px_45px_-20px_rgba(27,26,24,0.35)] sm:block">
        <div className="flex items-center gap-2 text-xs font-semibold text-ink">
          <span className="grid size-7 place-items-center rounded-lg bg-sun-400/15 text-sun-500">
            <NotebookPen className="size-4" />
          </span>
          Homework · Due today
        </div>
        <p className="mt-2.5 text-[13px] leading-snug text-ink-soft">
          Derivations — Current Electricity (Q1–Q6)
        </p>
      </div>

      {/* Floating card: marks */}
      <div
        className="absolute -bottom-10 -left-4 hidden w-52 animate-float rounded-2xl border border-line bg-surface p-4 shadow-[0_20px_45px_-20px_rgba(27,26,24,0.35)] sm:block"
        style={{ animationDelay: "1.4s" }}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-ink">Chemistry · Unit Test</p>
          <TrendingUp className="size-4 text-pine-600" />
        </div>
        <p className="mt-1 font-display text-2xl font-medium text-ink">
          88<span className="text-sm text-ink-muted">/100</span>
        </p>
        {/* mini score history bars */}
        <div className="mt-2.5 flex items-end gap-1.5" aria-hidden>
          {recentScores.map((score, index) => (
            <span
              key={index}
              className={`w-full rounded-sm ${
                index === recentScores.length - 1
                  ? "bg-pine-600"
                  : "bg-pine-200"
              }`}
              style={{ height: `${(score / 100) * 34 + 6}px` }}
            />
          ))}
        </div>
      </div>

      <p className="mt-14 text-center text-xs text-ink-muted sm:mt-16">
        Illustrative preview — your real dashboard arrives in the next steps.
      </p>
    </div>
  );
}
