"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Atom, FlaskConical, Sigma, type LucideIcon } from "lucide-react";
import { getBoard, getStream } from "@/lib/student";
import {
  buildPracticeSummary,
  type PracticeSubjectKey,
} from "@/lib/practice/summary";


import type { QuestionProgress } from "@/lib/practice/types";
import type { ConceptProgress } from "@/lib/practice/concept-types";
import { practiceService } from "@/services";
import { useStudent } from "@/components/app/student-context";
import { Reveal } from "@/components/ui/reveal";
import { ProgressBar } from "@/components/ui/progress-bar";

/*
  The unified Practice landing page: one card per practice
  subject the student actually has.

  Maths appears only for PCM / PCMB; Physics and Chemistry are
  common to all three streams.
*/

const VISUALS: Record<
  PracticeSubjectKey,
  { icon: LucideIcon; emoji: string; tile: string; bar: string }
> = {
  mathematics: {
    icon: Sigma,
    emoji: "🧮",
    tile: "bg-indigo-500/10 text-indigo-600",
    bar: "bg-indigo-500",
  },
  physics: {
    icon: Atom,
    emoji: "⚡",
    tile: "bg-sky-500/10 text-sky-600",
    bar: "bg-sky-500",
  },
  chemistry: {
    icon: FlaskConical,
    emoji: "🧪",
    tile: "bg-violet-500/10 text-violet-600",
    bar: "bg-violet-500",
  },
};

export function PracticeOverview() {
  const student = useStudent();
  const [maths, setMaths] = useState<QuestionProgress | null>(null);
  const [science, setScience] = useState<ConceptProgress | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMaths(practiceService.getMathsProgress());
          setScience(practiceService.getScienceProgress());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  if (student.status !== "ready" || !maths || !science) {
    return <OverviewSkeleton />;
  }

  const summary = buildPracticeSummary(
    student.profile.board,
    student.profile.stream,
    maths,
    science,
  );
  const board = getBoard(student.profile.board);
  const stream = getStream(student.profile.stream);

  return (
    <div className="space-y-8">
      <Reveal>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
              Practice
            </h1>
            <p className="mt-2 max-w-lg leading-relaxed text-ink-soft">
              Studying a chapter is one half. This is the other half — track
              the questions you&apos;ve actually worked through.
            </p>
          </div>
          <p className="shrink-0 rounded-full border border-pine-200 bg-pine-50 px-4 py-1.5 text-sm font-bold text-pine-700">
            {board.name} · {stream.name}
          </p>
        </div>
      </Reveal>

      {/* combined total */}
      <Reveal delay={50}>
        <section
          aria-label="Overall practice"
          className="rounded-3xl border border-line bg-surface p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
                All subjects
              </p>
              <p className="mt-2 font-display text-4xl font-medium tracking-tight text-ink">
                {summary.overall.completed}{" "}
                <span className="text-ink-muted">/ {summary.overall.total}</span>
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                questions completed · {summary.overall.remaining} remaining
              </p>
            </div>
            <p className="font-display text-3xl font-medium text-pine-700">
              {summary.overall.percent}%
            </p>
          </div>
          <ProgressBar
            percent={summary.overall.percent}
            label={`Overall practice: ${summary.overall.percent}%`}
            className="mt-5"
          />
        </section>
      </Reveal>

      {/* one card per subject */}
      <div className="grid gap-4 md:grid-cols-3">
        {summary.subjects.map((subject, index) => {
          const visual = VISUALS[subject.key];
          return (
            <Reveal key={subject.key} delay={80 + index * 60}>
              <Link
                href={subject.href}
                className="group flex h-full flex-col rounded-3xl border border-line bg-surface p-6 transition-all duration-200 hover:-translate-y-1 hover:border-pine-200 hover:shadow-[0_24px_50px_-28px_rgba(23,113,83,0.35)]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`grid size-11 place-items-center rounded-2xl ${visual.tile}`}
                  >
                    <visual.icon className="size-6" strokeWidth={2} />
                  </span>
                  <span className="text-lg" aria-hidden>
                    {visual.emoji}
                  </span>
                </div>

                <h2 className="mt-4 font-semibold tracking-tight text-ink">
                  {subject.name}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  {subject.blurb}
                </p>

                <p className="mt-4 font-display text-2xl font-medium text-ink">
                  {subject.stats.completed}{" "}
                  <span className="text-ink-muted">/ {subject.stats.total}</span>
                </p>
                <ProgressBar
                  percent={subject.stats.percent}
                  label={`${subject.name}: ${subject.stats.percent}%`}
                  className="mt-2.5"
                  barClassName={visual.bar}
                />

                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-pine-600">
                  Open
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-8" aria-hidden>
      <span className="block h-9 w-56 animate-pulse rounded-lg bg-line" />
      <span className="block h-40 animate-pulse rounded-3xl border border-line bg-surface" />
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-60 animate-pulse rounded-3xl border border-line bg-surface"
          />
        ))}
      </div>
    </div>
  );
}
