"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpenCheck, CircleDashed } from "lucide-react";
import { getBoard, getStream } from "@/lib/student";
import { SUBJECTS } from "@/lib/subjects";
import { getSyllabus } from "@/data/syllabus";
import {
  getSciencePractice,
  type SciencePracticeSubject,
} from "@/data/practice/science";
import {
  calculateChapterPracticeProgress,
  calculateSubjectPracticeProgress,
} from "@/lib/practice/concept-progress";
import { calculateChapterProgress } from "@/lib/syllabus/progress";


import type { ConceptProgress } from "@/lib/practice/concept-types";
import type { TopicProgress } from "@/lib/syllabus/types";
import { practiceService, syllabusService } from "@/services";
import {
  getPracticeProgressCloud,
  togglePracticeQuestionCloud,
} from "@/services/cloud-data-service";
import { useStudent } from "@/components/app/student-context";
import { Reveal } from "@/components/ui/reveal";
import { ProgressBar } from "@/components/ui/progress-bar";
import { MODE_LABEL } from "@/components/practice/mode-label";

/*
  Chapter list for Physics or Chemistry practice.
  Theory status is shown alongside — for context only. The two
  systems never change each other.
*/
export function ScienceHub({ subject }: { subject: SciencePracticeSubject }) {
  const student = useStudent();
  const [questions, setQuestions] = useState<ConceptProgress | null>(null);
  const [topics, setTopics] = useState<TopicProgress | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setQuestions(practiceService.getScienceProgress());
          setTopics(syllabusService.getProgress());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const practice = useMemo(
    () =>
      student.status === "ready"
        ? getSciencePractice(student.profile.board, subject)
        : null,
    [student, subject],
  );

  const theoryChapters = useMemo(() => {
    if (student.status !== "ready") return null;
    const syllabus = getSyllabus(student.profile.board, student.profile.stream);
    const found = syllabus.subjects.find((s) => s.subjectId === subject);
    return new Map(found?.chapters.map((c) => [c.id, c]) ?? []);
  }, [student, subject]);

  if (student.status !== "ready" || !practice || !questions || !topics || !theoryChapters) {
    return <HubSkeleton />;
  }

  const overall = calculateSubjectPracticeProgress(practice, questions);
  const meta = SUBJECTS[subject];
  const board = getBoard(student.profile.board);
  const stream = getStream(student.profile.stream);
  const isPhysics = subject === "physics";

  return (
    <div className="space-y-8">
      <Reveal>
        <Link
          href="/practice"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-pine-600"
        >
          <ArrowLeft className="size-4" />
          All practice
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
              {isPhysics ? "Physics Numericals" : "Chemistry Practice"}
            </h1>
            <p className="mt-2 max-w-xl leading-relaxed text-ink-soft">
              {isPhysics
                ? "30 numericals per chapter, grouped by the formulas and concepts that chapter actually uses."
                : "30 questions per chapter — organised by formulas where the chapter is calculation-based, and by concepts where it isn't."}
            </p>
          </div>
          <p className="shrink-0 rounded-full border border-pine-200 bg-pine-50 px-4 py-1.5 text-sm font-bold text-pine-700">
            {board.name} · {stream.name}
          </p>
        </div>
      </Reveal>

      {/* overall */}
      <Reveal delay={60}>
        <section
          aria-label={`Overall ${meta.name} practice`}
          className="rounded-3xl border border-line bg-surface p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
                Overall
              </p>
              <p className="mt-2 font-display text-4xl font-medium tracking-tight text-ink">
                {overall.completed}{" "}
                <span className="text-ink-muted">/ {overall.total}</span>
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                questions completed · {overall.remaining} remaining
              </p>
            </div>
            <p className="font-display text-3xl font-medium text-pine-700">
              {overall.percent}%
            </p>
          </div>
          <ProgressBar
            percent={overall.percent}
            label={`${meta.name} practice: ${overall.percent}%`}
            className="mt-5"
            barClassName={meta.accent.bar}
          />
          <p className="mt-3 text-xs text-ink-muted">
            {practice.chapters.length} chapters × 30 questions
          </p>
        </section>
      </Reveal>

      {/* chapters */}
      <div className="grid gap-4 sm:grid-cols-2">
        {practice.chapters.map((chapter, index) => {
          const stats = calculateChapterPracticeProgress(chapter, questions);
          const theoryChapter = theoryChapters.get(chapter.chapterId);
          const theory = theoryChapter
            ? calculateChapterProgress(theoryChapter, topics)
            : null;
          const theoryDone = theory !== null && theory.percent === 100;

          return (
            <Reveal key={chapter.chapterId} delay={index * 30}>
              <article className="flex h-full flex-col rounded-3xl border border-line bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-30px_rgba(27,26,24,0.35)] sm:p-6">
                <div className="flex items-start gap-3">
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-xl ${meta.accent.tile}`}
                  >
                    <meta.icon className="size-5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold leading-snug tracking-tight text-ink">
                      {chapter.title}
                    </h2>
                    <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                      {MODE_LABEL[chapter.mode]} · {chapter.categories.length}{" "}
                      concepts
                    </p>
                  </div>
                </div>

                {/* theory — separate system, shown for context */}
                <p className="mt-4 flex items-center gap-1.5 text-xs">
                  <span className="font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Theory
                  </span>
                  {theoryDone ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-pine-700">
                      <BookOpenCheck className="size-3.5" />
                      Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-ink-soft">
                      <CircleDashed className="size-3.5" />
                      {theory ? `${theory.percent}%` : "—"}
                    </span>
                  )}
                </p>

                <div className="mt-3">
                  <div className="flex items-baseline justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      Practice
                    </p>
                    <p className="text-sm font-semibold text-ink">
                      {stats.completed} / {stats.total}
                      <span className="ml-1.5 text-xs font-normal text-ink-muted">
                        {stats.percent}%
                      </span>
                    </p>
                  </div>
                  <ProgressBar
                    percent={stats.percent}
                    label={`${chapter.title} practice: ${stats.percent}%`}
                    className="mt-2"
                    barClassName={meta.accent.bar}
                  />
                </div>

                <Link
                  href={`/practice/${subject}/${chapter.chapterId}`}
                  className="mt-5 inline-flex h-10 items-center justify-center gap-2 self-start rounded-full bg-pine-600 px-5 text-sm font-medium text-white transition-colors hover:bg-pine-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-600"
                >
                  Practice
                  <ArrowRight className="size-4" />
                </Link>
              </article>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

function HubSkeleton() {
  return (
    <div className="space-y-8" aria-hidden>
      <span className="block h-9 w-72 max-w-full animate-pulse rounded-lg bg-line" />
      <span className="block h-40 animate-pulse rounded-3xl border border-line bg-surface" />
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-56 animate-pulse rounded-3xl border border-line bg-surface"
          />
        ))}
      </div>
    </div>
  );
}
