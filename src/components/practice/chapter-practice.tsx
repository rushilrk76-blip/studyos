"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpenCheck, CircleDashed } from "lucide-react";
import { streamHasMaths } from "@/lib/subjects";
import { getSyllabus } from "@/data/syllabus";
import { getPracticeChapter } from "@/data/practice";
import {
  calculateChapterPractice,
  withQuestionToggled,
  withSetToggled,
} from "@/lib/practice/progress";
import { calculateChapterProgress } from "@/lib/syllabus/progress";
import type { QuestionProgress } from "@/lib/practice/types";
import type { TopicProgress } from "@/lib/syllabus/types";
import { practiceService, syllabusService } from "@/services";
import { useStudent } from "@/components/app/student-context";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { QuestionSet } from "@/components/practice/question-set";

/*
  One Maths chapter's practice: 5 sets × 10 questions.
  Theory status is displayed for context only — ticking questions
  never changes theory, and vice versa.
*/
export function ChapterPractice({ chapterId }: { chapterId: string }) {
  const router = useRouter();
  const student = useStudent();
  const [questions, setQuestions] = useState<QuestionProgress | null>(null);
  const [topics, setTopics] = useState<TopicProgress | null>(null);
  const [openSets, setOpenSets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setQuestions(practiceService.getMathsProgress());
          setTopics(syllabusService.getProgress());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  /* Save practice progress on every change (its own storage key). */
  useEffect(() => {
    if (questions) practiceService.saveMathsProgress(questions);
  }, [questions]);

  const hasMaths =
    student.status === "ready" && streamHasMaths(student.profile.stream);

  useEffect(() => {
    if (student.status === "ready" && !hasMaths) router.replace("/dashboard");
  }, [student.status, hasMaths, router]);

  const chapter = useMemo(
    () =>
      student.status === "ready" && hasMaths
        ? getPracticeChapter(student.profile.board, chapterId)
        : undefined,
    [student, hasMaths, chapterId],
  );

  const theoryChapter = useMemo(() => {
    if (student.status !== "ready" || !hasMaths) return undefined;
    const syllabus = getSyllabus(student.profile.board, student.profile.stream);
    return syllabus.subjects
      .find((s) => s.subjectId === "mathematics")
      ?.chapters.find((c) => c.id === chapterId);
  }, [student, hasMaths, chapterId]);

  if (student.status !== "ready" || !questions || !topics) {
    return <ChapterSkeleton />;
  }

  /* Unknown chapter id (e.g. a Physics chapter, or a typo in the URL). */
  if (!chapter) {
    return (
      <div className="rounded-3xl border border-line bg-surface px-6 py-16 text-center">
        <p className="font-display text-2xl text-ink">Chapter not found</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
          This chapter isn&apos;t part of your board&apos;s Mathematics
          syllabus. Practice is available for Mathematics chapters only.
        </p>
        <Button href="/practice/maths" className="mt-6">
          Back to Mathematics Practice
        </Button>
      </div>
    );
  }

  const stats = calculateChapterPractice(chapter, questions);
  const theory = theoryChapter
    ? calculateChapterProgress(theoryChapter, topics)
    : null;
  const theoryDone = theory !== null && theory.percent === 100;

  return (
    <div className="space-y-7">
      <Link
        href="/practice/maths"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-pine-600"
      >
        <ArrowLeft className="size-4" />
        Mathematics Practice
      </Link>

      {/* chapter header */}
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
          Mathematics · Question Practice
        </p>
        <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
          {chapter.title}
        </h1>
      </header>

      {/* practice progress + theory status side by side */}
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
          barClassName="bg-indigo-500"
        />

        {/* theory is shown for context — it is a separate system */}
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
              {theory ? `${theory.completed}/${theory.total} topics` : "—"}
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

      {/* the five sets */}
      <section aria-label="Question sets" className="space-y-3">
        {chapter.sets.map((set) => (
          <QuestionSet
            key={set.id}
            set={set}
            progress={questions}
            open={openSets[set.id] === true}
            onToggleOpen={() =>
              setOpenSets((map) => ({ ...map, [set.id]: !map[set.id] }))
            }
            onToggleQuestion={(questionId) =>
              setQuestions((current) =>
                withQuestionToggled(current ?? {}, questionId),
              )
            }
            onToggleAll={(completed) =>
              setQuestions((current) =>
                withSetToggled(current ?? {}, set, completed),
              )
            }
          />
        ))}
      </section>

      <p className="text-center text-xs text-ink-muted">
        Question slots only — actual question content comes in a later update.
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
