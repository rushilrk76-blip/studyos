"use client";

import { useEffect, useMemo, useState } from "react";
import { ListTodo, Plus, Search, SearchX, X } from "lucide-react";
import {
  taskSubjectsForStream,
  type Task,
  type TaskDraft,
  type TaskFilter,
  type TaskSort,
} from "@/lib/homework/types";
import {
  calculateTaskStats,
  filterTasks,
  getTaskStatus,
  searchTasks,
  sortTasks,
  todayKey,
} from "@/lib/homework/tasks";
import { taskService } from "@/services";
import { useStudent } from "@/components/app/student-context";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { TaskCard } from "@/components/homework/task-card";
import { TaskForm } from "@/components/homework/task-form";

/*
  ────────────────────────────────────────────────
  Homework & Tasks page.

  Tasks are the student's own records: created here, stored in
  their own localStorage key, and never derived from — or able
  to change — syllabus topics or Maths practice questions.
  ────────────────────────────────────────────────
*/

const FILTERS: { id: TaskFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "overdue", label: "Overdue" },
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
];

const SORTS: { id: TaskSort; label: string }[] = [
  { id: "due-date", label: "Due date" },
  { id: "priority", label: "Priority" },
  { id: "recent", label: "Recently added" },
];

export function HomeworkView() {
  const student = useStudent();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [sort, setSort] = useState<TaskSort>("due-date");
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  /* Load once, on the client. */
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setTasks(taskService.getTasks());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  /* Persist on every change. */
  useEffect(() => {
    if (tasks) taskService.saveTasks(tasks);
  }, [tasks]);

  const today = todayKey();

  const subjects = useMemo(
    () =>
      student.status === "ready"
        ? taskSubjectsForStream(student.profile.stream)
        : [],
    [student],
  );

  const stats = useMemo(
    () => calculateTaskStats(tasks ?? [], today),
    [tasks, today],
  );

  const visible = useMemo(() => {
    if (!tasks) return [];
    let list = filterTasks(tasks, filter, today);
    if (subjectFilter !== "all") {
      list = list.filter((task) => task.subject === subjectFilter);
    }
    list = searchTasks(list, query);
    return sortTasks(list, sort, today);
  }, [tasks, filter, subjectFilter, query, sort, today]);

  if (student.status !== "ready" || !tasks) return <HomeworkSkeleton />;

  /* ── mutations ── */
  function handleSubmit(draft: TaskDraft) {
    setTasks((current) => {
      const list = current ?? [];
      if (editing) {
        /* Editing must NOT touch completion state. */
        return list.map((task) =>
          task.id === editing.id ? { ...task, ...draft } : task,
        );
      }
      const task: Task = {
        id: taskService.createId(),
        ...draft,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      };
      return [task, ...list];
    });
    setFormOpen(false);
    setEditing(null);
    toast(editing ? "Task updated." : "Task created.");
  }

  function toggleTask(id: string) {
    setTasks((current) =>
      (current ?? []).map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completedAt: task.completed ? null : new Date().toISOString(),
            }
          : task,
      ),
    );
  }

  function deleteTask(id: string) {
    setTasks((current) => (current ?? []).filter((task) => task.id !== id));
    toast("Task deleted.");
  }

  const hasAnyTasks = tasks.length > 0;
  const isFiltering =
    filter !== "all" || subjectFilter !== "all" || query.trim() !== "";

  /* Group the visible list so pending work reads first. */
  const pending = visible.filter((t) => !t.completed);
  const completed = visible.filter((t) => t.completed);

  return (
    <div className="space-y-7">
      {/* header */}
      <PageHeader
        title="Homework & Tasks"
        description="Keep track of everything you need to study, complete, or submit."
        action={
          <Button
            size="lg"
            className="shrink-0"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Add Task
          </Button>
        }
      />

      {/* stat strip */}
      {hasAnyTasks && (
        <Reveal delay={50}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatPill label="Pending" value={stats.pending} />
            <StatPill label="Due today" value={stats.today} accent="text-sun-500" />
            <StatPill label="Overdue" value={stats.overdue} accent="text-ember" />
            <StatPill
              label="Completed"
              value={stats.completed}
              accent="text-pine-700"
            />
          </div>
        </Reveal>
      )}

      {/* controls */}
      {hasAnyTasks && (
        <Reveal delay={80}>
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tasks…"
                  aria-label="Search tasks"
                  className="h-11 w-full rounded-full border border-line bg-surface pl-11 pr-10 text-sm text-ink placeholder:text-ink-muted/70 transition-colors focus:border-pine-600 focus:outline-none focus:ring-2 focus:ring-pine-600/20"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="task-sort" className="sr-only">
                  Sort tasks
                </label>
                <select
                  id="task-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as TaskSort)}
                  className="h-11 rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors focus:border-pine-600 focus:outline-none"
                >
                  {SORTS.map((option) => (
                    <option key={option.id} value={option.id}>
                      Sort: {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* status filters */}
            <div role="group" aria-label="Filter tasks" className="flex flex-wrap gap-2">
              {FILTERS.map((item) => (
                <Chip
                  key={item.id}
                  label={item.label}
                  active={filter === item.id}
                  onClick={() => setFilter(item.id)}
                />
              ))}
            </div>

            {/* subject filters */}
            <div role="group" aria-label="Filter by subject" className="flex flex-wrap gap-2">
              <Chip
                label="All subjects"
                active={subjectFilter === "all"}
                onClick={() => setSubjectFilter("all")}
              />
              {subjects.map((subject) => (
                <Chip
                  key={subject}
                  label={subject}
                  active={subjectFilter === subject}
                  onClick={() => setSubjectFilter(subject)}
                />
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* list */}
      {!hasAnyTasks ? (
        <EmptyState onAdd={() => setFormOpen(true)} />
      ) : visible.length === 0 ? (
        <div className="rounded-3xl border border-line bg-surface px-6 py-14 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-canvas text-ink-muted">
            <SearchX className="size-6" strokeWidth={1.9} />
          </span>
          <p className="mt-4 font-semibold text-ink">No tasks match</p>
          <p className="mt-1 text-sm text-ink-soft">
            Try a different search or clear your filters.
          </p>
          {isFiltering && (
            <Button
              variant="secondary"
              className="mt-5"
              onClick={() => {
                setQuery("");
                setFilter("all");
                setSubjectFilter("all");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <section aria-label="Pending tasks" className="space-y-3">
              <h2 className="text-sm font-semibold text-ink">
                Pending{" "}
                <span className="font-normal text-ink-muted">
                  ({pending.length})
                </span>
              </h2>
              {pending.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  today={today}
                  onToggle={() => toggleTask(task.id)}
                  onEdit={() => {
                    setEditing(task);
                    setFormOpen(true);
                  }}
                  onDelete={() => deleteTask(task.id)}
                />
              ))}
            </section>
          )}

          {completed.length > 0 && (
            <section aria-label="Completed tasks" className="space-y-3">
              <h2 className="text-sm font-semibold text-ink">
                Completed{" "}
                <span className="font-normal text-ink-muted">
                  ({completed.length})
                </span>
              </h2>
              {completed.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  today={today}
                  onToggle={() => toggleTask(task.id)}
                  onEdit={() => {
                    setEditing(task);
                    setFormOpen(true);
                  }}
                  onDelete={() => deleteTask(task.id)}
                />
              ))}
            </section>
          )}
        </div>
      )}

      {formOpen && (
        <TaskForm
          subjects={subjects}
          editing={editing}
          onSubmit={handleSubmit}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

/* ── small pieces ── */

function StatPill({
  label,
  value,
  accent = "text-ink",
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </p>
      <p className={`mt-0.5 font-display text-2xl font-medium ${accent}`}>
        {value}
      </p>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-9 rounded-full border px-3.5 text-[13px] font-medium transition-colors ${
        active
          ? "border-pine-600 bg-pine-50 text-pine-700"
          : "border-line bg-surface text-ink-soft hover:border-ink/25 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-3xl border border-line bg-surface px-6 py-16 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-pine-50 text-pine-600">
        <ListTodo className="size-7" strokeWidth={1.8} />
      </span>
      <p className="mt-5 font-display text-2xl font-medium tracking-tight text-ink">
        No homework yet
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
        Add your first task to stay organised.
      </p>
      <Button size="lg" className="mt-6" onClick={onAdd}>
        <Plus className="size-4" />
        Add Task
      </Button>
    </div>
  );
}

function HomeworkSkeleton() {
  return (
    <div className="space-y-7" aria-hidden>
      <span className="block h-10 w-72 max-w-full animate-pulse rounded-lg bg-line" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-20 animate-pulse rounded-2xl border border-line bg-surface"
          />
        ))}
      </div>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block h-28 animate-pulse rounded-2xl border border-line bg-surface"
        />
      ))}
    </div>
  );
}
