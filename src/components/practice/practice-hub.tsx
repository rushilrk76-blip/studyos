"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpenCheck, CircleDashed, Sigma } from "lucide-react";
import { getBoard, getStream } from "@/lib/student";
import { streamHasMaths } from "@/lib/subjects";
import { getSyllabus } from "@/data/syllabus";
import { getMathsPractice } from "@/data/practice";
import {
  calculateChapterPractice,
  calculateOverallPractice,
} from "@/lib/practice/progress";
import { calculateChapterProgress } from "@/lib/syllabus/progress";

import type { QuestionProgress } from "@/lib/practice/types";
import type { TopicProgress } from "@/lib/syllabus/types";
import { practiceService, syllabusService } from "@/services";
import { useStudent } from "@/components/app/student-context";
import { Reveal } from "@/components/ui/reveal";
import { ProgressBar } from "@/components/ui/progress-bar";

/*
  "Mathematics Practice" hub — every Maths chapter with its
  practice progress, plus its THEORY status shown separately
  (the two systems are independent and never affect each other).
*/
export function PracticeHub() {
  const router = useRouter();
  const student = useStudent();
  const [questions, setQuestions] = useState<QuestionProgress | null>(null);
  const [topics, setTopics] = useState<TopicProgress | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setQuestions(practiceService.getMathsProgress());
          setTopics(syllabusService.getProgress());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  /* PCB students don't study Maths — send them back to the dashboard. */
  const hasMaths =
    student.status === "ready" && streamHasMaths(student.profile.stream);

  useEffect(() => {
    if (student.status === "ready" && !hasMaths) router.replace("/dashboard");
  }, [student.status, hasMaths, router]);

  const practice = useMemo(
    () =>
      student.status === "ready" && hasMaths
        ? getMathsPractice(student.profile.board)
        : null,
    [student, hasMaths],
  );

  /* Theory chapters, keyed by id, so we can show theory status. */
  const theoryChapters = useMemo(() => {
    if (student.status !== "ready" || !hasMaths) return null;
    const syllabus = getSyllabus(
      student.profile.board,
      student.profile.stream,
    );
    const maths = syllabus.subjects.find((s) => s.subjectId === "mathematics");
    return new Map(maths?.chapters.map((c) => [c.id, c]) ?? []);
  }, [student, hasMaths]);

  if (
    student.status !== "ready" ||
    !practice ||
    !questions ||
    !topics ||
    !theoryChapters
  ) {
    return <HubSkeleton />;
  }

  const overall = calculateOverallPractice(practice, questions);
  const board = getBoard(student.profile.board);
  const stream = getStream(student.profile.stream);

  return (
    <div className="space-y-8">
      {/* header */}
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
              Mathematics Practice
            </h1>
            <p className="mt-2 max-w-lg leading-relaxed text-ink-soft">
              Studying a chapter is one half. This is the other half — track
              how many questions you&apos;ve actually practiced.
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
          aria-label="Overall practice progress"
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
            label={`Overall Mathematics practice: ${overall.percent}%`}
            className="mt-5"
          />
          <p className="mt-3 text-xs text-ink-muted">
            {practice.chapters.length} chapters × 5 sets × 10 questions
          </p>
        </section>
      </Reveal>

      {/* chapters */}
      <div className="grid gap-4 sm:grid-cols-2">
        {practice.chapters.map((chapter, index) => {
          const stats = calculateChapterPractice(chapter, questions);
          const theoryChapter = theoryChapters.get(chapter.chapterId);
          const theory = theoryChapter
            ? calculateChapterProgress(theoryChapter, topics)
            : null;
          const theoryDone = theory !== null && theory.percent === 100;

          return (
            <Reveal key={chapter.chapterId} delay={index * 40}>
              <article className="flex h-full flex-col rounded-3xl border border-line bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-30px_rgba(27,26,24,0.35)] sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-500/10 text-indigo-600">
                    <Sigma className="size-5" strokeWidth={2} />
                  </span>
                  <h2 className="min-w-0 flex-1 font-semibold leading-snug tracking-tight text-ink">
                    {chapter.title}
                  </h2>
                </div>

                {/* THEORY status — separate from practice, never linked */}
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
                      {theory
                        ? `${theory.completed}/${theory.total} topics`
                        : "—"}
                    </span>
                  )}
                </p>

                {/* PRACTICE progress */}
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
                    barClassName="bg-indigo-500"
                  />
                </div>

                <Link
                  href={`/practice/maths/${chapter.chapterId}`}
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
            className="h-52 animate-pulse rounded-3xl border border-line bg-surface"
          />
        ))}
      </div>
    </div>
  );
}
