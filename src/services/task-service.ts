import {
  createTaskId,
  loadTasks,
  saveTasks,
  clearTasks,
} from "@/lib/homework-storage";
import type { Task, TaskDraft } from "@/lib/homework/types";
import { nextOccurrenceDate } from "@/lib/homework/tasks";

/*
  ────────────────────────────────────────────────
  Task / Homework service.

  Encapsulates all CRUD on the student's tasks. The component
  never touches localStorage directly — it calls these methods
  and then re-reads via getTasks() to update React state.

  Data integrity: update/delete operate on a single record by
  id, never overwriting unrelated tasks.

  FUTURE: methods become async when backed by Supabase
  (a `tasks` table; addTask → INSERT, updateTask → UPDATE,
  deleteTask → DELETE, getTasks → SELECT).
  ────────────────────────────────────────────────
*/

export const taskService = {
  /** Generates a stable unique id for a new task. */
  createId(): string {
    return createTaskId();
  },

  getTasks(): Task[] {
    return loadTasks();
  },

  /** Creates a task from a draft, persists it, returns all tasks. */
  addTask(draft: TaskDraft): Task[] {
    const tasks = loadTasks();
    const task: Task = {
      id: createTaskId(),
      ...draft,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    const updated = [task, ...tasks];
    saveTasks(updated);
    return updated;
  },

  /** Updates a single task by id, preserving completion state. */
  updateTask(id: string, updates: Partial<TaskDraft>): Task[] {
    const nowIso = new Date().toISOString();
    const tasks = loadTasks().map((task) =>
      task.id === id ? { ...task, ...updates, updatedAt: nowIso } : task,
    );
    saveTasks(tasks);
    return tasks;
  },

  /** Deletes a single task by id. */
  deleteTask(id: string): Task[] {
    const tasks = loadTasks().filter((task) => task.id !== id);
    saveTasks(tasks);
    return tasks;
  },

  /**
   * Toggles a task's completion state by id.
   *
   * If the task recurs and is being COMPLETED, one next occurrence
   * is created (never an unbounded series). Duplicate occurrences
   * are avoided by checking for an existing task with the same
   * title + subject + next date.
   */
  toggleComplete(id: string): Task[] {
    const tasks = loadTasks();
    const target = tasks.find((t) => t.id === id);
    const nowIso = new Date().toISOString();

    let updated = tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            completed: !task.completed,
            completedAt: task.completed ? null : nowIso,
            updatedAt: nowIso,
          }
        : task,
    );

    /* Spawn the next occurrence only when completing a recurring task. */
    if (target && !target.completed) {
      const nextDate = nextOccurrenceDate(target);
      if (nextDate) {
        const alreadyExists = updated.some(
          (t) =>
            t.title === target.title &&
            t.subject === target.subject &&
            t.dueDate === nextDate &&
            !t.completed,
        );
        if (!alreadyExists) {
          updated = [
            {
              ...target,
              id: createTaskId(),
              dueDate: nextDate,
              completed: false,
              completedAt: null,
              createdAt: nowIso,
              updatedAt: nowIso,
            },
            ...updated,
          ];
        }
      }
    }

    saveTasks(updated);
    return updated;
  },

  /** Persists an arbitrary task array (used by dashboard bulk toggle). */
  saveTasks(tasks: Task[]): void {
    saveTasks(tasks);
  },

  clearTasks(): void {
    clearTasks();
  },
};
