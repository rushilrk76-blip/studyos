"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SUBJECTS } from "@/lib/subjects";
import type {
  Chapter,
  SubjectSyllabus,
  Topic,
  TopicProgress,
} from "@/lib/syllabus/types";
import { calculateSubjectProgress } from "@/lib/syllabus/progress";
import { ChapterSection } from "@/components/syllabus/chapter-section";

/*
  One subject (e.g. Physics): header with progress, expandable
  to reveal its chapters and topics.
*/
export function SubjectCard({
  subjectSyllabus,
  visibleChapters,
  progress,
  forceOpen,
  defaultOpen = false,
  onToggleTopic,
}: {
  subjectSyllabus: SubjectSyllabus;
  /** Chapters + their visible topics after search/filter. */
  visibleChapters: { chapter: Chapter; topics: Topic[] }[];
  progress: TopicProgress;
  /** While searching/filtering, everything stays expanded. */
  forceOpen: boolean;
  /** Start expanded (used when a single subject is filtered). */
  defaultOpen?: boolean;
  onToggleTopic: (topicId: string) => void;
}) {
  const [selfOpen, setSelfOpen] = useState(defaultOpen);
  const [closedChapters, setClosedChapters] = useState<Record<string, boolean>>(
    {},
  );

  const subject = SUBJECTS[subjectSyllabus.subjectId];
  const stats = calculateSubjectProgress(subjectSyllabus, progress);
  const open = selfOpen || forceOpen;

  return (
    <article className="overflow-hidden rounded-3xl border border-line bg-surface">
      {/* subject header — whole row toggles */}
      <button
        type="button"
        onClick={() => setSelfOpen((value) => !value)}
        aria-expanded={open}
        className="w-full px-5 py-5 text-left transition-colors hover:bg-canvas/60 sm:px-6"
      >
        <div className="flex items-center gap-4">
          <span
            className={`grid size-11 shrink-0 place-items-center rounded-xl ${subject.accent.tile}`}
          >
            <subject.icon className="size-[22px]" strokeWidth={2} />
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-2">
              <span className="truncate font-semibold tracking-tight text-ink">
                {subject.name}
              </span>
              <span className="shrink-0 font-display text-xl font-medium text-ink">
                {stats.percent}%
              </span>
            </span>
            <span className="mt-0.5 block text-xs text-ink-muted">
              {stats.completed} / {stats.total} topics completed ·{" "}
              {stats.remaining} remaining
            </span>
          </span>

          <ChevronDown
            className={`size-5 shrink-0 text-ink-muted transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>

        {/* subject progress bar */}
        <span
          className="mt-4 block h-1.5 overflow-hidden rounded-full bg-line/60"
          role="progressbar"
          aria-valuenow={stats.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${subject.name} progress: ${stats.percent}%`}
        >
          <span
            className={`block h-full rounded-full transition-all duration-500 ${subject.accent.bar}`}
            style={{ width: `${stats.percent}%` }}
          />
        </span>
      </button>

      {/* chapters */}
      {open && (
        <div className="border-t border-line/70">
          {visibleChapters.map(({ chapter, topics }) => (
            <ChapterSection
              key={chapter.id}
              chapter={chapter}
              topics={topics}
              progress={progress}
              /* chapters default to OPEN; the map only remembers closes */
              open={closedChapters[chapter.id] !== true}
              forceOpen={forceOpen}
              practiceSubject={
                subjectSyllabus.subjectId === "mathematics"
                  ? "maths"
                  : subjectSyllabus.subjectId === "physics"
                    ? "physics"
                    : subjectSyllabus.subjectId === "chemistry"
                      ? "chemistry"
                      : null
              }
              onToggleOpen={() =>
                setClosedChapters((map) => ({
                  ...map,
                  [chapter.id]: map[chapter.id] !== true,
                }))
              }
              onToggleTopic={onToggleTopic}
            />
          ))}
        </div>
      )}
    </article>
  );
}
