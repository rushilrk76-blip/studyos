"use client";

import { useEffect, useRef, useState } from "react";
import { CircleAlert} from "lucide-react";
import {
  PRIORITIES,
  RECURRENCE_OPTIONS,
  REMINDER_OPTIONS,
  TASK_TYPES,
  taskSubjectsForStream,
  type Priority,
  type Recurrence,
  type ReminderLead,
  type Task,
  type TaskDraft,
  type TaskType,
} from "@/lib/homework/types";
import { todayKey } from "@/lib/homework/tasks";
import type { StreamId } from "@/lib/student";
import { reminderService } from "@/services";
import { Button } from "@/components/ui/button";
import { ModalShell } from "@/components/ui/modal";

/*
  Planner task form — the full task editor including the
  planner-only fields (time, recurrence, reminder).

  Produces a TaskDraft for the SAME Task model used by
  Homework — no separate planner record.
*/

const inputBase =
  "mt-1.5 w-full rounded-2xl border bg-surface px-4 text-[15px] text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-pine-600/25";

export function PlannerTaskForm({
  stream,
  editing,
  defaultDate,
  onSubmit,
  onClose,
}: {
  stream: StreamId;
  editing: Task | null;
  defaultDate?: string;
  onSubmit: (draft: TaskDraft) => void;
  onClose: () => void;
}) {
  const subjects = taskSubjectsForStream(stream);
  const [draft, setDraft] = useState<TaskDraft>({
    title: editing?.title ?? "",
    subject: editing?.subject ?? subjects[0] ?? "Other",
    type: editing?.type ?? "Study",
    dueDate: editing?.dueDate ?? defaultDate ?? todayKey(),
    dueTime: editing?.dueTime ?? "",
    priority: editing?.priority ?? "Medium",
    notes: editing?.notes ?? "",
    recurrence: editing?.recurrence ?? "None",
    reminder: editing?.reminder ?? "None",
  });
  const [showErrors, setShowErrors] = useState(false);
  const [permissionNote, setPermissionNote] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const titleError = draft.title.trim() === "" ? "Please enter a task title." : "";
  const dateError = draft.dueDate === "" ? "Please pick a date." : "";
  const isValid = !titleError && !dateError;

  /* Only request notification permission on explicit opt-in. */
  async function handleReminderChange(value: ReminderLead) {
    setDraft({ ...draft, reminder: value });
    if (value === "None") {
      setPermissionNote(null);
      return;
    }
    if (!reminderService.isSupported()) {
      setPermissionNote("Browser notifications are not supported on this device.");
      return;
    }
    const permission = reminderService.getPermission();
    if (permission === "default") {
      const result = await reminderService.requestPermission();
      setPermissionNote(
        result === "granted"
          ? "Reminders enabled. They only work while StudyOS is open."
          : "Notifications were not allowed — you'll still see the task in your planner.",
      );
    } else if (permission === "denied") {
      setPermissionNote(
        "Notifications are blocked in your browser settings.",
      );
    } else {
      setPermissionNote("Reminders only work while StudyOS is open in a tab.");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) {
      setShowErrors(true);
      return;
    }
    onSubmit({
      ...draft,
      title: draft.title.trim(),
      notes: draft.notes.trim(),
      dueTime: draft.dueTime || undefined,
    });
  }

  return (
    <ModalShell
      title={editing ? "Edit study task" : "Add study task"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        {/* Title */}
          <div>
            <label htmlFor="pt-title" className="text-sm font-semibold text-ink">
              Task title <span className="text-ember">*</span>
            </label>
            <input
              id="pt-title"
              ref={titleRef}
              type="text"
              maxLength={120}
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="e.g., Revise Current Electricity"
              aria-invalid={showErrors && !!titleError}
              className={`${inputBase} h-12 ${showErrors && titleError ? "border-ember" : "border-line focus:border-pine-600"}`}
            />
            {showErrors && titleError && <Err msg={titleError} />}
          </div>

          {/* Subject + Type */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="pt-subject" className="text-sm font-semibold text-ink">Subject</label>
              <select
                id="pt-subject"
                value={draft.subject}
                onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                className={`${inputBase} h-12 border-line focus:border-pine-600`}
              >
                {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="pt-type" className="text-sm font-semibold text-ink">Task type</label>
              <select
                id="pt-type"
                value={draft.type}
                onChange={(e) => setDraft({ ...draft, type: e.target.value as TaskType })}
                className={`${inputBase} h-12 border-line focus:border-pine-600`}
              >
                {TASK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Date + Time */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="pt-date" className="text-sm font-semibold text-ink">
                Date <span className="text-ember">*</span>
              </label>
              <input
                id="pt-date"
                type="date"
                value={draft.dueDate}
                onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
                aria-invalid={showErrors && !!dateError}
                className={`${inputBase} h-12 ${showErrors && dateError ? "border-ember" : "border-line focus:border-pine-600"}`}
              />
              {showErrors && dateError && <Err msg={dateError} />}
            </div>
            <div>
              <label htmlFor="pt-time" className="text-sm font-semibold text-ink">
                Time <span className="font-normal text-ink-muted">(optional)</span>
              </label>
              <input
                id="pt-time"
                type="time"
                value={draft.dueTime ?? ""}
                onChange={(e) => setDraft({ ...draft, dueTime: e.target.value })}
                className={`${inputBase} h-12 border-line focus:border-pine-600`}
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <span className="text-sm font-semibold text-ink">Priority</span>
            <div role="radiogroup" aria-label="Priority" className="mt-2 grid grid-cols-3 gap-2">
              {PRIORITIES.map((p) => {
                const active = draft.priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setDraft({ ...draft, priority: p })}
                    className={`h-11 rounded-2xl border text-sm font-medium transition-colors ${
                      active
                        ? "border-pine-600 bg-pine-50 text-pine-700"
                        : "border-line bg-surface text-ink-soft hover:border-ink/25 hover:text-ink"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Repeat + Reminder */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="pt-repeat" className="text-sm font-semibold text-ink">Repeat</label>
              <select
                id="pt-repeat"
                value={draft.recurrence ?? "None"}
                onChange={(e) => setDraft({ ...draft, recurrence: e.target.value as Recurrence })}
                className={`${inputBase} h-12 border-line focus:border-pine-600`}
              >
                {RECURRENCE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="pt-reminder" className="text-sm font-semibold text-ink">Reminder</label>
              <select
                id="pt-reminder"
                value={draft.reminder ?? "None"}
                onChange={(e) => handleReminderChange(e.target.value as ReminderLead)}
                disabled={!draft.dueDate}
                className={`${inputBase} h-12 border-line focus:border-pine-600 disabled:opacity-50`}
              >
                {REMINDER_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {permissionNote && (
            <p className="rounded-xl border border-line bg-canvas/50 px-4 py-2.5 text-xs text-ink-soft">
              {permissionNote}
            </p>
          )}

          {/* Notes */}
          <div>
            <label htmlFor="pt-notes" className="text-sm font-semibold text-ink">
              Notes <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <textarea
              id="pt-notes"
              rows={2}
              maxLength={500}
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              className={`${inputBase} resize-none border-line py-3 focus:border-pine-600`}
            />
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-line/70 pt-5 sm:flex-row sm:justify-end">
            <Button variant="secondary" size="lg" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="lg">{editing ? "Save changes" : "Add Task"}</Button>
          </div>
        </form>
    </ModalShell>
  );
}

function Err({ msg }: { msg: string }) {
  return (
    <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm text-ember">
      <CircleAlert className="size-4 shrink-0" /> {msg}
    </p>
  );
}
