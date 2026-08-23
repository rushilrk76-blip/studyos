"use client";

import { useEffect, useRef, useState } from "react";
import { ModalShell } from "@/components/ui/modal";
import { CircleAlert } from "lucide-react";
import {
  PRIORITIES,
  TASK_TYPES,
  type Priority,
  type Task,
  type TaskDraft,
  type TaskType,
} from "@/lib/homework/types";
import { todayKey } from "@/lib/homework/tasks";
import { Button } from "@/components/ui/button";

/*
  The Add / Edit task form, shown in a modal sheet.
  Editing reuses the same form — completion status is never
  part of the draft, so editing can't reset it.
*/

const inputBase =
  "mt-1.5 w-full rounded-2xl border bg-surface px-4 text-[15px] text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-pine-600/25";

export function TaskForm({
  subjects,
  editing,
  onSubmit,
  onClose,
}: {
  /** Subject options from the student's stream (+ English, Other). */
  subjects: string[];
  /** When present, the form edits this task instead of creating one. */
  editing: Task | null;
  onSubmit: (draft: TaskDraft) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<TaskDraft>({
    title: editing?.title ?? "",
    subject: editing?.subject ?? subjects[0] ?? "Other",
    type: editing?.type ?? "Homework",
    dueDate: editing?.dueDate ?? todayKey(),
    priority: editing?.priority ?? "Medium",
    notes: editing?.notes ?? "",
  });
  const [showErrors, setShowErrors] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  /* Close on Escape. */
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const errors = {
    title: draft.title.trim() === "" ? "Please give your task a title." : "",
    subject: draft.subject === "" ? "Please choose a subject." : "",
    dueDate: draft.dueDate === "" ? "Please pick a due date." : "",
  };
  const isValid = !errors.title && !errors.subject && !errors.dueDate;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isValid) {
      setShowErrors(true);
      return;
    }
    onSubmit({ ...draft, title: draft.title.trim(), notes: draft.notes.trim() });
  }

  return (
    <ModalShell
      title={editing ? "Edit task" : "Add a task"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="task-title" className="text-sm font-semibold text-ink">
              Task title <span className="text-ember">*</span>
            </label>
            <input
              id="task-title"
              ref={titleRef}
              type="text"
              value={draft.title}
              maxLength={120}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="e.g., Complete Exercise 5.2"
              aria-invalid={showErrors && !!errors.title}
              className={`${inputBase} h-12 ${
                showErrors && errors.title
                  ? "border-ember"
                  : "border-line focus:border-pine-600"
              }`}
            />
            <FieldError show={showErrors} message={errors.title} />
          </div>

          {/* Subject + Type */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="task-subject"
                className="text-sm font-semibold text-ink"
              >
                Subject <span className="text-ember">*</span>
              </label>
              <select
                id="task-subject"
                value={draft.subject}
                onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                className={`${inputBase} h-12 border-line focus:border-pine-600`}
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
              <FieldError show={showErrors} message={errors.subject} />
            </div>

            <div>
              <label htmlFor="task-type" className="text-sm font-semibold text-ink">
                Task type
              </label>
              <select
                id="task-type"
                value={draft.type}
                onChange={(e) =>
                  setDraft({ ...draft, type: e.target.value as TaskType })
                }
                className={`${inputBase} h-12 border-line focus:border-pine-600`}
              >
                {TASK_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due date */}
          <div>
            <label htmlFor="task-due" className="text-sm font-semibold text-ink">
              Due date <span className="text-ember">*</span>
            </label>
            <input
              id="task-due"
              type="date"
              value={draft.dueDate}
              onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
              aria-invalid={showErrors && !!errors.dueDate}
              className={`${inputBase} h-12 ${
                showErrors && errors.dueDate
                  ? "border-ember"
                  : "border-line focus:border-pine-600"
              }`}
            />
            <FieldError show={showErrors} message={errors.dueDate} />
          </div>

          {/* Priority */}
          <div>
            <span className="text-sm font-semibold text-ink">Priority</span>
            <div
              role="radiogroup"
              aria-label="Priority"
              className="mt-2 grid grid-cols-3 gap-2"
            >
              {PRIORITIES.map((priority) => {
                const active = draft.priority === priority;
                return (
                  <button
                    key={priority}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setDraft({ ...draft, priority })}
                    className={`h-11 rounded-2xl border text-sm font-medium transition-colors ${
                      active
                        ? "border-pine-600 bg-pine-50 text-pine-700"
                        : "border-line bg-surface text-ink-soft hover:border-ink/25 hover:text-ink"
                    }`}
                  >
                    {priority}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="task-notes" className="text-sm font-semibold text-ink">
              Notes <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <textarea
              id="task-notes"
              value={draft.notes}
              rows={3}
              maxLength={500}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              placeholder="Anything you want to remember…"
              className={`${inputBase} resize-none border-line py-3 focus:border-pine-600`}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-2 border-t border-line/70 pt-5 sm:flex-row sm:justify-end">
            <Button variant="secondary" size="lg" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="lg">
              {editing ? "Save changes" : "Add Task"}
            </Button>
          </div>
        </form>
    </ModalShell>
  );
}

function FieldError({ show, message }: { show: boolean; message: string }) {
  if (!show || !message) return null;
  return (
    <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm text-ember">
      <CircleAlert className="size-4 shrink-0" />
      {message}
    </p>
  );
}
