"use client";

import { Check, ChevronDown } from "lucide-react";
import type {
  ConceptProgress,
  PracticeCategory,
} from "@/lib/practice/concept-types";
import {
  calculatePracticeProgress,
  isQuestionDone,
} from "@/lib/practice/concept-progress";
import { ProgressBar } from "@/components/ui/progress-bar";

/*
  One expandable concept / formula group, e.g.
  "Ohm's Law — 3 / 5", with its question checkboxes inside.

  Question slots only — no question text exists yet.
*/
export function ConceptCategory({
  category,
  progress,
  open,
  barClassName,
  onToggleOpen,
  onToggleQuestion,
  onToggleAll,
}: {
  category: PracticeCategory;
  progress: ConceptProgress;
  open: boolean;
  barClassName: string;
  onToggleOpen: () => void;
  onToggleQuestion: (questionId: string) => void;
  onToggleAll: (completed: boolean) => void;
}) {
  const stats = calculatePracticeProgress(category, progress);
  const allDone = stats.completed === stats.total;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <button
        type="button"
        onClick={onToggleOpen}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-canvas/70 sm:px-5"
      >
        <ChevronDown
          className={`size-4 shrink-0 text-ink-muted transition-transform duration-200 ${
            open ? "" : "-rotate-90"
          }`}
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-3">
            <span
              className={`min-w-0 text-sm font-semibold leading-snug ${
                allDone ? "text-pine-700" : "text-ink"
              }`}
            >
              {category.name}
            </span>
            <span className="shrink-0 text-sm font-semibold text-ink">
              {stats.completed} / {stats.total}
            </span>
          </span>
          <ProgressBar
            percent={stats.percent}
            label={`${category.name}: ${stats.percent}%`}
            className="mt-2 h-1.5"
            barClassName={barClassName}
          />
        </span>
      </button>

      {open && (
        <div className="border-t border-line/70 px-2 pb-3 pt-2 sm:px-3">
          <div className="flex justify-end px-1 pb-1">
            <button
              type="button"
              onClick={() => onToggleAll(!allDone)}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
            >
              {allDone ? "Clear this concept" : `Mark all ${stats.total} done`}
            </button>
          </div>

          <ul className="grid gap-0.5 sm:grid-cols-2">
            {category.questions.map((question) => {
              const done = isQuestionDone(question.id, progress);
              return (
                <li key={question.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={done}
                    onClick={() => onToggleQuestion(question.id)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors duration-150 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-pine-600 active:bg-pine-50"
                  >
                    <span
                      aria-hidden
                      className={`grid size-5 shrink-0 place-items-center rounded-md border-2 transition-all duration-150 ${
                        done
                          ? "border-pine-600 bg-pine-600"
                          : "border-line bg-surface"
                      }`}
                    >
                      {done && (
                        <Check className="size-3.5 text-white" strokeWidth={3.5} />
                      )}
                    </span>
                    <span
                      className={`text-[15px] transition-colors ${
                        done
                          ? "text-ink-muted line-through decoration-line"
                          : "text-ink"
                      }`}
                    >
                      Question {question.number}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
