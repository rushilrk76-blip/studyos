"use client";

import Link from "next/link";
import { ChevronDown, Sigma } from "lucide-react";
import type { Chapter, Topic, TopicProgress } from "@/lib/syllabus/types";
import {
  calculateChapterProgress,
  calculateTopicProgress,
} from "@/lib/syllabus/progress";
import { TopicRow } from "@/components/syllabus/topic-row";

/*
  A collapsible chapter (▼ Chapter 1 / ▶ Chapter 2) with its
  topic rows inside. `forceOpen` is used while searching so
  matches are never hidden inside a closed chapter.
*/
export function ChapterSection({
  chapter,
  topics,
  progress,
  open,
  forceOpen,
  practiceSubject = null,
  onToggleOpen,
  onToggleTopic,
}: {
  chapter: Chapter;
  /** The topics to display (already filtered by search/filter). */
  topics: Topic[];
  progress: TopicProgress;
  open: boolean;
  forceOpen: boolean;
  /** Maths/Physics/Chemistry chapters link to their question practice. */
  practiceSubject?: "maths" | "physics" | "chemistry" | null;
  onToggleOpen: () => void;
  onToggleTopic: (topicId: string) => void;
}) {
  const expanded = open || forceOpen;
  const stats = calculateChapterProgress(chapter, progress);
  const allDone = stats.total > 0 && stats.completed === stats.total;

  return (
    <div className="border-t border-line/70 first:border-t-0">
      <button
        type="button"
        onClick={onToggleOpen}
        aria-expanded={expanded}
        className="flex w-full items-center gap-2.5 px-4 py-4 text-left transition-colors hover:bg-canvas/70 sm:px-5"
      >
        <ChevronDown
          className={`size-4 shrink-0 text-ink-muted transition-transform duration-200 ${
            expanded ? "" : "-rotate-90"
          }`}
        />
        <span className="min-w-0 flex-1">
          <span
            className={`block truncate text-sm font-semibold ${
              allDone ? "text-pine-700" : "text-ink"
            }`}
          >
            {chapter.title}
          </span>
          <span className="block truncate text-xs text-ink-muted">
            {stats.completed} of {stats.total} topics
            {chapter.unit ? ` · ${chapter.unit}` : ""}
          </span>
        </span>

        {/* thin chapter progress bar */}
        <span className="hidden w-24 shrink-0 sm:block" aria-hidden>
          <span className="block h-1.5 overflow-hidden rounded-full bg-line/60">
            <span
              className="block h-full rounded-full bg-pine-600 transition-all duration-300"
              style={{ width: `${stats.percent}%` }}
            />
          </span>
        </span>
      </button>

      {expanded && (
        <ul className="space-y-0.5 px-2 pb-3 sm:px-3">
          {topics.map((topic) => (
            <TopicRow
              key={topic.id}
              topic={topic}
              status={calculateTopicProgress(topic, progress)}
              onToggle={() => onToggleTopic(topic.id)}
            />
          ))}
          {topics.length === 0 && (
            <li className="px-3 py-3 text-sm text-ink-muted">
              No topics here match your current search or filter.
            </li>
          )}
        </ul>
      )}

      {/*
        Practice link for Maths chapters — deliberately OUTSIDE the topic
        list and visually separated, so question practice is never
        confused with theory/topic checkboxes.
      */}
      {open && practiceSubject && (
        <div className="mx-2 mb-3 mt-1 rounded-xl border border-dashed border-line bg-canvas/60 px-4 py-3 sm:mx-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-ink-muted">
              Studied this chapter? Track your question practice separately.
            </p>
            <Link
              href={`/practice/${practiceSubject}/${chapter.id}`}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-xs font-semibold text-ink transition-colors hover:border-pine-600 hover:text-pine-700"
            >
              <Sigma className="size-3.5 text-indigo-600" />
              Practice Questions
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
