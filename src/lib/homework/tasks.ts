import {
  PRIORITY_RANK,
  type Task,
  type TaskFilter,
  type TaskSort,
  type TaskStats,
  type TaskStatus,
} from "@/lib/homework/types";

/*
  ────────────────────────────────────────────────
  All task date logic and statistics live here.

  Dates are handled as plain "YYYY-MM-DD" local calendar
  strings. Comparing strings avoids every timezone bug that
  comes with Date objects (a task due "today" in India must
  not flip to "overdue" because of UTC).
  ────────────────────────────────────────────────
*/

/** Today as "YYYY-MM-DD" in the student's own timezone. */
export function todayKey(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * A task's live status.
 * Overdue is DERIVED — the stored dueDate is never rewritten.
 */
export function getTaskStatus(task: Task, today = todayKey()): TaskStatus {
  if (task.completed) return "completed";
  if (task.dueDate < today) return "overdue";
  if (task.dueDate === today) return "today";
  return "upcoming";
}

/** "Due today", "Due tomorrow", "3 days overdue", "Due 12 Jun"… */
export function formatDueDate(dueDate: string, today = todayKey()): string {
  const days = daysBetween(today, dueDate);
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days === -1) return "1 day overdue";
  if (days < -1) return `${Math.abs(days)} days overdue`;
  if (days <= 7) return `Due in ${days} days`;
  return `Due ${formatDayMonth(dueDate)}`;
}

export function formatDayMonth(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return dateKey;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(year, month - 1, day));
}

/** Whole days from `from` to `to` (negative = in the past). */
function daysBetween(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00`);
  const b = Date.parse(`${to}T00:00:00`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / 86_400_000);
}

/* ── Recurrence ─────────────────────────────── */
/**
 * Computes the next occurrence date for a recurring task.
 * Returns null when the task doesn't recur.
 * Only ONE next occurrence is created — never an unbounded series.
 */
export function nextOccurrenceDate(task: Task): string | null {
  if (!task.recurrence || task.recurrence === "None") return null;
  const [year, month, day] = task.dueDate.split("-").map(Number);
  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  if (task.recurrence === "Daily") date.setDate(date.getDate() + 1);
  else if (task.recurrence === "Weekly") date.setDate(date.getDate() + 7);
  else if (task.recurrence === "Monthly") date.setMonth(date.getMonth() + 1);
  else return null;

  return todayKey(date);
}

/* ── Planner grouping ───────────────────────── */
/** Tasks scheduled on a specific date (pending + completed). */
export function getTasksForDate(tasks: Task[], dateKey: string): Task[] {
  return tasks.filter((task) => task.dueDate === dateKey);
}

/** Groups upcoming tasks by their due date, earliest first. */
export function groupUpcomingByDate(
  tasks: Task[],
  today = todayKey(),
): { date: string; tasks: Task[] }[] {
  const upcoming = tasks.filter(
    (task) => !task.completed && task.dueDate > today,
  );
  const groups = new Map<string, Task[]>();
  for (const task of upcoming) {
    const group = groups.get(task.dueDate) ?? [];
    group.push(task);
    groups.set(task.dueDate, group);
  }
  return [...groups.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, list]) => ({
      date,
      tasks: list.sort(
        (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
      ),
    }));
}

/** Set of date keys that have at least one task (for calendar dots). */
export function getDatesWithTasks(tasks: Task[]): Set<string> {
  return new Set(tasks.map((task) => task.dueDate));
}

/* ── Reusable statistics (used by the page AND the dashboard) ── */
export function calculateTaskStats(
  tasks: Task[],
  today = todayKey(),
): TaskStats {
  const stats: TaskStats = {
    total: tasks.length,
    pending: 0,
    completed: 0,
    today: 0,
    overdue: 0,
    upcoming: 0,
  };

  for (const task of tasks) {
    const status = getTaskStatus(task, today);
    if (status === "completed") {
      stats.completed += 1;
      continue;
    }
    stats.pending += 1;
    if (status === "overdue") stats.overdue += 1;
    else if (status === "today") stats.today += 1;
    else stats.upcoming += 1;
  }

  return stats;
}

/** Pending tasks due today — used by the dashboard's Today's Tasks. */
export function getTodaysTasks(tasks: Task[], today = todayKey()): Task[] {
  return sortTasks(
    tasks.filter((task) => getTaskStatus(task, today) === "today"),
    "priority",
    today,
  );
}

/* ── Filtering, searching, sorting ──────────── */
export function filterTasks(
  tasks: Task[],
  filter: TaskFilter,
  today = todayKey(),
): Task[] {
  if (filter === "all") return tasks;
  return tasks.filter((task) => {
    const status = getTaskStatus(task, today);
    if (filter === "pending") return status !== "completed";
    return status === filter;
  });
}

export function searchTasks(tasks: Task[], query: string): Task[] {
  const q = query.trim().toLowerCase();
  if (!q) return tasks;
  return tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(q) ||
      task.subject.toLowerCase().includes(q) ||
      task.type.toLowerCase().includes(q) ||
      task.notes.toLowerCase().includes(q),
  );
}

/*
  Default ordering puts pending work first, and within pending:
  overdue → today → upcoming. Completed tasks always sink to
  the bottom (they're kept, never auto-deleted).
*/
const STATUS_RANK: Record<TaskStatus, number> = {
  overdue: 0,
  today: 1,
  upcoming: 2,
  completed: 3,
};

export function sortTasks(
  tasks: Task[],
  sort: TaskSort,
  today = todayKey(),
): Task[] {
  return [...tasks].sort((a, b) => {
    const rank =
      STATUS_RANK[getTaskStatus(a, today)] -
      STATUS_RANK[getTaskStatus(b, today)];
    if (rank !== 0) return rank;

    if (sort === "priority") {
      const p = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (p !== 0) return p;
      return a.dueDate.localeCompare(b.dueDate);
    }

    if (sort === "recent") {
      return b.createdAt.localeCompare(a.createdAt);
    }

    /* due-date (default) */
    const d = a.dueDate.localeCompare(b.dueDate);
    if (d !== 0) return d;
    return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  });
}
