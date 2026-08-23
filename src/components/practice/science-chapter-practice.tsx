"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpenCheck, CircleDashed } from "lucide-react";
import { SUBJECTS } from "@/lib/subjects";
import { getSyllabus } from "@/data/syllabus";
import {
  getScienceChapter,
  type SciencePracticeSubject,
} from "@/data/practice/science";
import {
  calculateChapterPracticeProgress,
  withCategoryToggled,
  withConceptQuestionToggled,
} from "@/lib/practice/concept-progress";
import { calculateChapterProgress } from "@/lib/syllabus/progress";
import type { ConceptProgress } from "@/lib/practice/concept-types";
import type { TopicProgress } from "@/lib/syllabus/types";
import { practiceService, syllabusService } from "@/services";
import { useStudent } from "@/components/app/student-context";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ConceptCategory } from "@/components/practice/concept-category";
import { MODE_LABEL } from "@/components/practice/mode-label";

/*
  One Physics/Chemistry chapter: 30 questions grouped by the
  chapter's own concepts. Theory progress is displayed for
  context only — the two systems stay independent.
*/
export function ScienceChapterPractice({
  subject,
  chapterId,
}: {
  subject: SciencePracticeSubject;
  chapterId: string;
}) {
  const student = useStudent();
  const [questions, setQuestions] = useState<ConceptProgress | null>(null);
  const [topics, setTopics] = useState<TopicProgress | null>(null);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setQuestions(practiceService.getScienceProgress());
          setTopics(syllabusService.getProgress());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (questions) practiceService.saveScienceProgress(questions);
  }, [questions]);

  const chapter = useMemo(
    () =>
      student.status === "ready"
        ? getScienceChapter(student.profile.board, subject, chapterId)
        : undefined,
    [student, subject, chapterId],
  );

  const theoryChapter = useMemo(() => {
    if (student.status !== "ready") return undefined;
    const syllabus = getSyllabus(student.profile.board, student.profile.stream);
    return syllabus.subjects
      .find((s) => s.subjectId === subject)
      ?.chapters.find((c) => c.id === chapterId);
  }, [student, subject, chapterId]);

  if (student.status !== "ready" || !questions || !topics) {
    return <ChapterSkeleton />;
  }

  if (!chapter) {
    return (
      <div className="rounded-3xl border border-line bg-surface px-6 py-16 text-center">
        <p className="font-display text-2xl text-ink">Chapter not found</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
          This chapter isn&apos;t part of your board&apos;s {SUBJECTS[subject].name}{" "}
          syllabus.
        </p>
        <Button href={`/practice/${subject}`} className="mt-6">
          Back to practice
        </Button>
      </div>
    );
  }

  const meta = SUBJECTS[subject];
  const stats = calculateChapterPracticeProgress(chapter, questions);
  const theory = theoryChapter
    ? calculateChapterProgress(theoryChapter, topics)
    : null;
  const theoryDone = theory !== null && theory.percent === 100;

  return (
    <div className="space-y-7">
      <Link
        href={`/practice/${subject}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-pine-600"
      >
        <ArrowLeft className="size-4" />
        {meta.name} Practice
      </Link>

      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
          {meta.name} · {MODE_LABEL[chapter.mode]}
        </p>
        <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
          {chapter.title}
        </h1>
      </header>

      <section className="rounded-3xl border border-line bg-surface p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Practice progress
            </p>
            <p className="mt-1.5 font-display text-3xl font-medium tracking-tight text-ink">
              {stats.completed}{" "}
              <span className="text-ink-muted">/ {stats.total}</span>
            </p>
          </div>
          <p className="font-display text-2xl font-medium text-pine-700">
            {stats.percent}%
          </p>
        </div>
        <ProgressBar
          percent={stats.percent}
          label={`${chapter.title} practice: ${stats.percent}%`}
          className="mt-4"
          barClassName={meta.accent.bar}
        />

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line/70 pt-4 text-sm">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Theory
          </span>
          {theoryDone ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pine-50 px-3 py-1 text-xs font-semibold text-pine-700">
              <BookOpenCheck className="size-3.5" />
              Completed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs font-medium text-ink-soft">
              <CircleDashed className="size-3.5" />
              {theory
                ? `${theory.completed}/${theory.total} topics · ${theory.percent}%`
                : "—"}
            </span>
          )}
          <Link
            href="/syllabus"
            className="text-xs font-medium text-pine-600 underline-offset-2 hover:underline"
          >
            Open syllabus
          </Link>
        </div>
      </section>

      <section aria-label="Concepts" className="space-y-3">
        {chapter.categories.map((category) => (
          <ConceptCategory
            key={category.id}
            category={category}
            progress={questions}
            open={openCategories[category.id] === true}
            barClassName={meta.accent.bar}
            onToggleOpen={() =>
              setOpenCategories((map) => ({
                ...map,
                [category.id]: !map[category.id],
              }))
            }
            onToggleQuestion={(questionId) =>
              setQuestions((current) =>
                withConceptQuestionToggled(current ?? {}, questionId),
              )
            }
            onToggleAll={(completed) =>
              setQuestions((current) =>
                withCategoryToggled(current ?? {}, category, completed),
              )
            }
          />
        ))}
      </section>

      <p className="text-center text-xs text-ink-muted">
        Question slots only — verified question content comes in a later update.
      </p>
    </div>
  );
}

function ChapterSkeleton() {
  return (
    <div className="space-y-7" aria-hidden>
      <span className="block h-5 w-44 animate-pulse rounded bg-line" />
      <span className="block h-10 w-80 max-w-full animate-pulse rounded-lg bg-line" />
      <span className="block h-44 animate-pulse rounded-3xl border border-line bg-surface" />
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="block h-20 animate-pulse rounded-2xl border border-line bg-surface"
        />
      ))}
    </div>
  );
}
