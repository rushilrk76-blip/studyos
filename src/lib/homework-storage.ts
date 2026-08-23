import {
  PRIORITIES,
  RECURRENCE_OPTIONS,
  REMINDER_OPTIONS,
  TASK_TYPES,
  type Priority,
  type Recurrence,
  type ReminderLead,
  type Task,
  type TaskType,
} from "@/lib/homework/types";

/*
  ────────────────────────────────────────────────
  localStorage persistence for the student's tasks.

  Its own key — separate from the syllabus and practice keys —
  so the three systems can never overwrite each other.

  Only the student's personal task records are stored. No
  syllabus data, no practice structure.
  ────────────────────────────────────────────────
*/

const TASKS_KEY = "studyos:tasks:v1";

function isTaskType(value: unknown): value is TaskType {
  return (
    typeof value === "string" && (TASK_TYPES as readonly string[]).includes(value)
  );
}

function isPriority(value: unknown): value is Priority {
  return (
    typeof value === "string" && (PRIORITIES as readonly string[]).includes(value)
  );
}

function isRecurrence(value: unknown): value is Recurrence {
  return (
    typeof value === "string" &&
    (RECURRENCE_OPTIONS as readonly string[]).includes(value)
  );
}

function isReminder(value: unknown): value is ReminderLead {
  return (
    typeof value === "string" &&
    (REMINDER_OPTIONS as readonly string[]).includes(value)
  );
}

/** Storage is untrusted input — every field is validated. */
function parseTask(value: unknown): Task | null {
  if (!value || typeof value !== "object") return null;
  const o = value as Record<string, unknown>;

  if (typeof o.id !== "string" || o.id === "") return null;
  if (typeof o.title !== "string" || o.title.trim() === "") return null;
  if (typeof o.subject !== "string" || o.subject === "") return null;
  if (typeof o.dueDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(o.dueDate))
    return null;

  return {
    id: o.id,
    title: o.title,
    subject: o.subject,
    type: isTaskType(o.type) ? o.type : "Homework",
    dueDate: o.dueDate,
    priority: isPriority(o.priority) ? o.priority : "Medium",
    notes: typeof o.notes === "string" ? o.notes : "",
    completed: o.completed === true,
    createdAt: typeof o.createdAt === "string" ? o.createdAt : "",
    completedAt: typeof o.completedAt === "string" ? o.completedAt : null,
    /* Planner fields — optional, validated leniently. */
    dueTime:
      typeof o.dueTime === "string" && /^\d{2}:\d{2}$/.test(o.dueTime)
        ? o.dueTime
        : undefined,
    recurrence: isRecurrence(o.recurrence) ? o.recurrence : undefined,
    reminder: isReminder(o.reminder) ? o.reminder : undefined,
    updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : undefined,
  };
}

export function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TASKS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(parseTask)
      .filter((task): task is Task => task !== null);
  } catch {
    return []; // corrupted JSON → start empty, never crash
  }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {
    // Storage full / private browsing — UI still works this session.
  }
}

export function clearTasks(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TASKS_KEY);
}

/** Stable unique id, with a fallback for older browsers. */
export function createTaskId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
