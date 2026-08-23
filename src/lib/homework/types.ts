import type { StreamId } from "@/lib/student";
import { subjectsForStream } from "@/lib/subjects";

/*
  ────────────────────────────────────────────────
  Homework & Tasks — the student's PERSONAL data.

  This is a third, completely independent system:

    1. Syllabus topics        (official curriculum)
    2. Maths practice slots   (generated structure)
    3. Homework tasks         (created by the student) ← this file

  A task is authored by the student, so unlike the other two
  systems the records themselves live in localStorage — there
  is no static dataset to derive them from.
  ────────────────────────────────────────────────
*/

/* ── Subjects available in the task form ────── */
/*
  Comes from the student's stream, plus two universal options.
  We never invent extra academic subjects.
*/
export const EXTRA_TASK_SUBJECTS = ["English", "Other"] as const;

export function taskSubjectsForStream(stream: StreamId): string[] {
  return [
    ...subjectsForStream(stream).map((subject) => subject.name),
    ...EXTRA_TASK_SUBJECTS,
  ];
}

/* ── Task type ──────────────────────────────── */
export const TASK_TYPES = [
  "Homework",
  "Study",
  "Assignment",
  "Revision",
  "Practice",
  "Project",
  "Test Preparation",
  "Other",
] as const;

export type TaskType = (typeof TASK_TYPES)[number];

/* ── Priority ───────────────────────────────── */
export const PRIORITIES = ["Low", "Medium", "High"] as const;
export type Priority = (typeof PRIORITIES)[number];

/** Sort order for "priority" sorting — High first. */
export const PRIORITY_RANK: Record<Priority, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

/* ── Recurrence ─────────────────────────────── */
export const RECURRENCE_OPTIONS = ["None", "Daily", "Weekly", "Monthly"] as const;
export type Recurrence = (typeof RECURRENCE_OPTIONS)[number];

/* ── Reminder lead time ─────────────────────── */
export const REMINDER_OPTIONS = [
  "None",
  "At scheduled time",
  "10 minutes before",
  "30 minutes before",
  "1 hour before",
  "1 day before",
] as const;
export type ReminderLead = (typeof REMINDER_OPTIONS)[number];

/** Minutes before the scheduled time for each reminder option. */
export const REMINDER_MINUTES: Record<ReminderLead, number | null> = {
  None: null,
  "At scheduled time": 0,
  "10 minutes before": 10,
  "30 minutes before": 30,
  "1 hour before": 60,
  "1 day before": 1440,
};

/* ── The task itself ────────────────────────── */
/*
  ONE Task model, shared by Homework, Planner, Dashboard,
  Global Search and Portfolio. There is no separate
  HomeworkTask / PlannerTask — the same record powers
  every view. Planner-specific fields are optional so
  existing tasks keep working unchanged.
*/
export type Task = {
  /** Stable unique id (crypto.randomUUID), never an array index. */
  id: string;
  title: string;
  /** Subject name as chosen in the form, e.g. "Mathematics" or "English". */
  subject: string;
  type: TaskType;
  /** Local calendar date, "YYYY-MM-DD" — no timezone surprises. */
  dueDate: string;
  priority: Priority;
  notes: string;
  completed: boolean;
  createdAt: string; // ISO timestamp
  completedAt: string | null;
  /* ── Planner fields (all optional / backwards-compatible) ── */
  /** Optional scheduled time, "HH:MM" (24-hour). */
  dueTime?: string;
  /** Optional repeat rule. Next occurrence is created on completion. */
  recurrence?: Recurrence;
  /** Optional reminder lead time — requires dueTime to fire. */
  reminder?: ReminderLead;
  /** Last edit timestamp. */
  updatedAt?: string;
};

/** The editable fields — what the add/edit form produces. */
export type TaskDraft = {
  title: string;
  subject: string;
  type: TaskType;
  dueDate: string;
  priority: Priority;
  notes: string;
  dueTime?: string;
  recurrence?: Recurrence;
  reminder?: ReminderLead;
};

/* ── Time-of-day grouping for the Planner's Today view ── */
export type DayPart = "Morning" | "Afternoon" | "Evening" | "Anytime";

/** Groups a task into a part of the day from its dueTime. */
export function getDayPart(task: Task): DayPart {
  if (!task.dueTime) return "Anytime";
  const hour = Number(task.dueTime.split(":")[0]);
  if (Number.isNaN(hour)) return "Anytime";
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

export const DAY_PARTS: DayPart[] = ["Morning", "Afternoon", "Evening", "Anytime"];

/* ── Derived status ─────────────────────────── */
/*
  Computed from the due date at read time — the stored dueDate
  is NEVER modified when a task becomes overdue.
*/
export type TaskStatus = "completed" | "overdue" | "today" | "upcoming";

export type TaskFilter =
  | "all"
  | "pending"
  | "completed"
  | "today"
  | "upcoming"
  | "overdue";

export type TaskSort = "due-date" | "priority" | "recent";

export type TaskStats = {
  total: number;
  pending: number;
  completed: number;
  today: number;
  overdue: number;
  upcoming: number;
};
