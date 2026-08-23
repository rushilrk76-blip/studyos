"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { ExamResult } from "@/lib/marks/types";
import {
  calcPercentage,
  formatExamDate,
  GRADE_LABEL,
  GRADE_STYLES,
  gradeForPercentage,
} from "@/lib/marks/results";

/*
  One result card. Marks + maximum shown raw; percentage derived.
  A quiet performance chip carries the status — never harsh.
*/

const SUBJECT_TILE = {
  Physics: "bg-sky-500/10 text-sky-600",
  Chemistry: "bg-violet-500/10 text-violet-600",
  Mathematics: "bg-indigo-500/10 text-indigo-600",
  Biology: "bg-pine-600/10 text-pine-600",
  English: "bg-ember/10 text-ember",
  Other: "bg-ink/5 text-ink-soft",
} as const;

export function ResultCard({
  result,
  onEdit,
  onDelete,
}: {
  result: ExamResult;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const percent = calcPercentage(result.marksObtained, result.maximumMarks);
  const grade = gradeForPercentage(percent);
  const style = GRADE_STYLES[grade];
  const tile = SUBJECT_TILE[result.subject as keyof typeof SUBJECT_TILE] ?? SUBJECT_TILE.Other;

  return (
    <article className="rounded-2xl border border-line bg-surface p-4 transition-colors sm:p-5">
      <div className="flex items-start gap-3">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-xl text-[11px] font-bold ${tile}`}
        >
          {result.subject.slice(0, 3).toUpperCase()}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-semibold leading-snug text-ink">
                {result.examName}
              </h3>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-muted">
                <span className="font-medium text-ink-soft">
                  {result.subject}
                </span>
                <span aria-hidden>·</span>
                <span>{result.examType}</span>
                <span aria-hidden>·</span>
                <span>{formatExamDate(result.examDate)}</span>
              </p>
            </div>

            {/* actions */}
            <div ref={menuRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label={`Actions for ${result.examName}`}
                className="grid size-9 place-items-center rounded-full text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <MoreVertical className="size-4" />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-20 mt-1 w-44 animate-pop rounded-2xl border border-line bg-surface p-1.5 shadow-[0_20px_45px_-20px_rgba(27,26,24,0.35)]"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
                  >
                    <Pencil className="size-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setConfirmingDelete(true);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ember transition-colors hover:bg-ember/5"
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* marks + percentage */}
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <p className="font-display text-2xl font-medium tracking-tight text-ink">
              {result.marksObtained}{" "}
              <span className="text-ink-muted">/ {result.maximumMarks}</span>
            </p>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-medium text-ink">
                {percent}%
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${style.chip}`}
              >
                {GRADE_LABEL[grade]}
              </span>
            </div>
          </div>

          {result.notes && (
            <p className="mt-3 whitespace-pre-wrap rounded-xl bg-canvas px-3 py-2 text-[13px] leading-relaxed text-ink-soft">
              {result.notes}
            </p>
          )}
        </div>
      </div>

      {/* delete confirmation */}
      {confirmingDelete && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ember/30 bg-ember/5 px-4 py-3">
          <p className="text-sm text-ink">Delete this result permanently?</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="h-9 rounded-full px-3.5 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="h-9 rounded-full bg-ember px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
