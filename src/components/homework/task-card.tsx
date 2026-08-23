"use client";

import { useEffect, useRef, useState } from "react";
import { Check, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { Task, TaskStatus } from "@/lib/homework/types";
import { formatDueDate, getTaskStatus } from "@/lib/homework/tasks";

/*
  One task row. Restrained visual language: a small coloured dot
  and a quiet label carry the status — no loud colour blocks.
*/

const STATUS_STYLES: Record<
  TaskStatus,
  { dot: string; label: string; text: string }
> = {
  overdue: { dot: "bg-ember", label: "Overdue", text: "text-ember" },
  today: { dot: "bg-sun-500", label: "Due today", text: "text-sun-500" },
  upcoming: { dot: "bg-ink-muted", label: "Upcoming", text: "text-ink-muted" },
  completed: { dot: "bg-pine-600", label: "Completed", text: "text-pine-700" },
};

const PRIORITY_STYLES = {
  High: "border-ember/30 text-ember",
  Medium: "border-line text-ink-soft",
  Low: "border-line text-ink-muted",
} as const;

export function TaskCard({
  task,
  today,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task;
  today: string;
  onToggle: () => void;
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

  const status = getTaskStatus(task, today);
  const style = STATUS_STYLES[status];
  const done = task.completed;

  return (
    <article
      className={`rounded-2xl border bg-surface p-4 transition-colors sm:p-5 ${
        done ? "border-line/70 bg-canvas/40" : "border-line"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* completion checkbox */}
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          aria-label={done ? `Mark "${task.title}" pending` : `Mark "${task.title}" complete`}
          onClick={onToggle}
          className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-600 ${
            done ? "border-pine-600 bg-pine-600" : "border-line hover:border-pine-600"
          }`}
        >
          {done && <Check className="size-3.5 text-white" strokeWidth={3.5} />}
        </button>

        <div className="min-w-0 flex-1">
          <h3
            className={`text-[15px] font-semibold leading-snug ${
              done ? "text-ink-muted line-through decoration-line" : "text-ink"
            }`}
          >
            {task.title}
          </h3>

          {/* meta line */}
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
            <span className="font-medium text-ink-soft">{task.subject}</span>
            <span aria-hidden>·</span>
            <span>{task.type}</span>
          </p>

          {/* status + priority */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${style.text}`}>
              <span className={`size-1.5 rounded-full ${style.dot}`} aria-hidden />
              {done ? style.label : formatDueDate(task.dueDate, today)}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_STYLES[task.priority]}`}
            >
              {task.priority}
            </span>
          </div>

          {task.notes && (
            <p className="mt-2.5 whitespace-pre-wrap rounded-xl bg-canvas px-3 py-2 text-[13px] leading-relaxed text-ink-soft">
              {task.notes}
            </p>
          )}
        </div>

        {/* actions */}
        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`Actions for ${task.title}`}
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

      {/* delete confirmation */}
      {confirmingDelete && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ember/30 bg-ember/5 px-4 py-3">
          <p className="text-sm text-ink">Delete this task permanently?</p>
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
