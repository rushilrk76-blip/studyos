"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CalendarRange,
  Check,
  Clock,
  ListTodo,
  MoreVertical,
  Pencil,
  Plus,
  Sparkles,
  Sun,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import {
  DAY_PARTS,
  getDayPart,
  taskSubjectsForStream,
  TASK_TYPES,
  type DayPart,
  type Task,
  type TaskDraft,
} from "@/lib/homework/types";
import {
  filterTasks,
  formatDayMonth,
  formatDueDate,
  getTasksForDate,
  getTodaysTasks,
  groupUpcomingByDate,
  sortTasks,
  todayKey,
} from "@/lib/homework/tasks";
import { getNextStudyAction } from "@/lib/study-nav";
import { taskService, syllabusService, practiceService } from "@/services";
import { useStudent } from "@/components/app/student-context";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { PlannerTaskForm } from "@/components/planner/planner-task-form";
import { PlannerCalendar } from "@/components/planner/planner-calendar";

/*
  ────────────────────────────────────────────────
  Study Planner — Today / Upcoming / Calendar.

  Reads and writes the SAME Task data as Homework via
  taskService. There is no separate planner storage:
  completing a task here updates it everywhere.
  ────────────────────────────────────────────────
*/

type PlannerTab = "today" | "upcoming" | "calendar";

export function PlannerView() {
  const student = useStudent();
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [tab, setTab] = useState<PlannerTab>("today");
  const [typeFilter, setTypeFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setTasks(taskService.getTasks());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const today = todayKey();

  const filtered = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (subjectFilter !== "all" && t.subject !== subjectFilter) return false;
      return true;
    });
  }, [tasks, typeFilter, subjectFilter]);

  const toggleTask = useCallback((id: string) => {
    setTasks(taskService.toggleComplete(id));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(taskService.deleteTask(id));
  }, []);

  function handleSubmit(draft: TaskDraft) {
    if (editing) {
      setTasks(taskService.updateTask(editing.id, draft));
    } else {
      setTasks(taskService.addTask(draft));
    }
    setFormOpen(false);
    setEditing(null);
  }

  if (student.status !== "ready" || !tasks) return <PlannerSkeleton />;

  const subjects = taskSubjectsForStream(student.profile.stream);
  const todays = getTodaysTasks(filtered, today);
  const todaysCompleted = filtered.filter(
    (t) => t.dueDate === today && t.completed,
  );
  const overdue = sortTasks(filterTasks(filtered, "overdue", today), "priority", today);
  const upcomingGroups = groupUpcomingByDate(filtered, today);
  const dateTasks = getTasksForDate(filtered, selectedDate);

  /* Suggested study plan — from real data, requires confirmation to add. */
  const suggestion = getNextStudyAction({
    board: student.profile.board,
    stream: student.profile.stream,
    tasks,
    topicProgress: syllabusService.getProgress(),
    questionProgress: practiceService.getMathsProgress(),
    scienceProgress: practiceService.getScienceProgress(),
  });

  return (
    <div className="space-y-7">
      {/* header */}
      <PageHeader
        title="My Study Planner"
        description="Plan your study, assignments and revision."
        action={
          <Button
            size="lg"
            onClick={() => { setEditing(null); setFormOpen(true); }}
          >
            <Plus className="size-4" />
            Add Study Task
          </Button>
        }
      />

      {/* suggested plan */}
      {suggestion.hasAction && (
        <Reveal delay={40}>
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-pine-200 bg-pine-50 p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-pine-600 text-white">
              <Sparkles className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-pine-700">
                Suggested Study Plan
              </p>
              <p className="mt-0.5 truncate font-semibold text-ink">{suggestion.label}</p>
              <p className="truncate text-sm text-ink-soft">{suggestion.detail}</p>
            </div>
            <Button
              variant="secondary"
              size="md"
              className="shrink-0"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="size-4" />
              Add to Planner
            </Button>
          </div>
        </Reveal>
      )}

      {/* tabs */}
      <Reveal delay={60}>
        <div className="flex gap-1 rounded-full border border-line bg-surface p-1">
          {([
            { id: "today", label: "Today", icon: Sun },
            { id: "upcoming", label: "Upcoming", icon: CalendarDays },
            { id: "calendar", label: "Calendar", icon: CalendarRange },
          ] as const).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-pine-600 text-white"
                  : "text-ink-soft hover:bg-ink/5 hover:text-ink"
              }`}
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          ))}
        </div>
      </Reveal>

      {/* filters */}
      <Reveal delay={70}>
        <div className="flex flex-wrap gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filter by task type"
            className="h-9 rounded-full border border-line bg-surface px-3.5 text-xs font-medium text-ink-soft focus:border-pine-600 focus:outline-none"
          >
            <option value="all">All types</option>
            {TASK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            aria-label="Filter by subject"
            className="h-9 rounded-full border border-line bg-surface px-3.5 text-xs font-medium text-ink-soft focus:border-pine-600 focus:outline-none"
          >
            <option value="all">All subjects</option>
            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </Reveal>

      {/* overdue banner (always visible) */}
      {overdue.length > 0 && (
        <Reveal delay={80}>
          <section aria-labelledby="overdue-h">
            <div className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-ember/10 text-ember">
                <TriangleAlert className="size-4" />
              </span>
              <h2 id="overdue-h" className="text-lg font-semibold tracking-tight text-ink">
                Overdue
              </h2>
              <span className="rounded-full bg-ember/10 px-2 py-0.5 text-xs font-bold text-ember">
                {overdue.length}
              </span>
            </div>
            <ul className="mt-3 space-y-2">
              {overdue.slice(0, 4).map((task) => (
                <TaskRow key={task.id} task={task} today={today}
                  onToggle={() => toggleTask(task.id)}
                  onEdit={() => { setEditing(task); setFormOpen(true); }}
                  onDelete={() => deleteTask(task.id)} />
              ))}
            </ul>
          </section>
        </Reveal>
      )}

      {/* ── TODAY ── */}
      {tab === "today" && (
        <Reveal delay={90}>
          <section aria-label="Today's plan" className="space-y-5">
            <h2 className="text-lg font-semibold tracking-tight text-ink">Today&apos;s Plan</h2>
            {todays.length === 0 && todaysCompleted.length === 0 ? (
              <Empty text="No study tasks planned for today." onAdd={() => { setEditing(null); setFormOpen(true); }} />
            ) : (
              <>
                {DAY_PARTS.map((part) => {
                  const items = todays.filter((t) => getDayPart(t) === part);
                  if (items.length === 0) return null;
                  return (
                    <div key={part}>
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                        {part}
                      </p>
                      <ul className="space-y-2">
                        {items.map((task) => (
                          <TaskRow key={task.id} task={task} today={today}
                            onToggle={() => toggleTask(task.id)}
                            onEdit={() => { setEditing(task); setFormOpen(true); }}
                            onDelete={() => deleteTask(task.id)} />
                        ))}
                      </ul>
                    </div>
                  );
                })}
                {todaysCompleted.length > 0 && (
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                      Completed ({todaysCompleted.length})
                    </p>
                    <ul className="space-y-2">
                      {todaysCompleted.map((task) => (
                        <TaskRow key={task.id} task={task} today={today}
                          onToggle={() => toggleTask(task.id)}
                          onEdit={() => { setEditing(task); setFormOpen(true); }}
                          onDelete={() => deleteTask(task.id)} />
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </section>
        </Reveal>
      )}

      {/* ── UPCOMING ── */}
      {tab === "upcoming" && (
        <Reveal delay={90}>
          <section aria-label="Upcoming tasks" className="space-y-5">
            {upcomingGroups.length === 0 ? (
              <Empty text="No upcoming tasks." onAdd={() => { setEditing(null); setFormOpen(true); }} />
            ) : (
              upcomingGroups.map(({ date, tasks: list }) => (
                <div key={date}>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                    {formatDueDate(date, today) === "Due tomorrow" ? "Tomorrow" : formatDayMonth(date)}
                  </p>
                  <ul className="space-y-2">
                    {list.map((task) => (
                      <TaskRow key={task.id} task={task} today={today}
                        onToggle={() => toggleTask(task.id)}
                        onEdit={() => { setEditing(task); setFormOpen(true); }}
                        onDelete={() => deleteTask(task.id)} />
                    ))}
                  </ul>
                </div>
              ))
            )}
          </section>
        </Reveal>
      )}

      {/* ── CALENDAR ── */}
      {tab === "calendar" && (
        <Reveal delay={90}>
          <div className="space-y-5">
            <PlannerCalendar
              tasks={filtered}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
            <section aria-label="Tasks on selected date">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                {formatDayMonth(selectedDate)}
              </p>
              {dateTasks.length === 0 ? (
                <div className="rounded-2xl border border-line bg-surface px-6 py-10 text-center">
                  <p className="text-sm text-ink-muted">No tasks on this date.</p>
                  <Button className="mt-4" onClick={() => { setEditing(null); setFormOpen(true); }}>
                    <Plus className="size-4" /> Add Task
                  </Button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {dateTasks.map((task) => (
                    <TaskRow key={task.id} task={task} today={today}
                      onToggle={() => toggleTask(task.id)}
                      onEdit={() => { setEditing(task); setFormOpen(true); }}
                      onDelete={() => deleteTask(task.id)} />
                  ))}
                </ul>
              )}
            </section>
          </div>
        </Reveal>
      )}

      {/* link to homework */}
      <Reveal delay={100}>
        <Link href="/homework" className="inline-flex items-center gap-1.5 text-sm font-medium text-pine-600 hover:text-pine-700">
          Manage all homework <ArrowRight className="size-4" />
        </Link>
      </Reveal>

      {formOpen && (
        <PlannerTaskForm
          stream={student.profile.stream}
          editing={editing}
          defaultDate={tab === "calendar" ? selectedDate : undefined}
          onSubmit={handleSubmit}
          onClose={() => { setFormOpen(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

/* ── task row ── */
const PRIORITY_LABEL = { High: "HIGH", Medium: "MED", Low: "LOW" } as const;

function TaskRow({
  task, today, onToggle, onEdit, onDelete,
}: {
  task: Task; today: string;
  onToggle: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const [menu, setMenu] = useState(false);
  const done = task.completed;
  const isOverdue = !done && task.dueDate < today;

  return (
    <li className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
      done ? "border-line/60 bg-canvas/30" : "border-line bg-surface"
    }`}>
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={done ? `Mark "${task.title}" pending` : `Mark "${task.title}" complete`}
        onClick={onToggle}
        className={`grid size-5 shrink-0 place-items-center rounded-md border-2 transition-all ${
          done ? "border-pine-600 bg-pine-600" : "border-line hover:border-pine-600"
        }`}
      >
        {done && <Check className="size-3.5 text-white" strokeWidth={3.5} />}
      </button>

      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm ${done ? "text-ink-muted line-through" : "font-medium text-ink"}`}>
          {task.title}
        </p>
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-ink-muted">
          <span>{task.subject}</span>
          <span aria-hidden>·</span>
          <span>{task.type}</span>
          {task.dueTime && (
            <>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-0.5">
                <Clock className="size-3" />{task.dueTime}
              </span>
            </>
          )}
          {task.recurrence && task.recurrence !== "None" && (
            <>
              <span aria-hidden>·</span>
              <span>{task.recurrence}</span>
            </>
          )}
        </p>
      </div>

      {/* priority — text, not just colour */}
      <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold ${
        task.priority === "High" ? "border-ember/40 text-ember"
        : task.priority === "Medium" ? "border-line text-ink-soft"
        : "border-line text-ink-muted"
      }`}>
        {PRIORITY_LABEL[task.priority]}
      </span>

      {isOverdue && (
        <span className="shrink-0 text-[10px] font-bold uppercase text-ember">Overdue</span>
      )}

      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMenu((v) => !v)}
          aria-label={`Actions for ${task.title}`}
          className="grid size-8 place-items-center rounded-full text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <MoreVertical className="size-4" />
        </button>
        {menu && (
          <div
            role="menu"
            onMouseLeave={() => setMenu(false)}
            className="absolute right-0 top-full z-20 mt-1 w-32 animate-pop rounded-xl border border-line bg-surface p-1.5 shadow-lg"
          >
            <button type="button" role="menuitem"
              onClick={() => { setMenu(false); onEdit(); }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ink-soft hover:bg-ink/5 hover:text-ink">
              <Pencil className="size-3.5" /> Edit
            </button>
            <button type="button" role="menuitem"
              onClick={() => { setMenu(false); onDelete(); }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ember hover:bg-ember/5">
              <Trash2 className="size-3.5" /> Delete
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

function Empty({ text, onAdd }: { text: string; onAdd: () => void }) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-6 py-12 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-pine-50 text-pine-600">
        <ListTodo className="size-6" strokeWidth={1.8} />
      </span>
      <p className="mt-3 font-semibold text-ink">{text}</p>
      <Button className="mt-4" onClick={onAdd}>
        <Plus className="size-4" /> Add Study Task
      </Button>
    </div>
  );
}

function PlannerSkeleton() {
  return (
    <div className="space-y-7" aria-hidden>
      <span className="block h-10 w-72 max-w-full animate-pulse rounded-lg bg-line" />
      <span className="block h-12 animate-pulse rounded-full border border-line bg-surface" />
      {[0, 1, 2].map((i) => (
        <span key={i} className="block h-16 animate-pulse rounded-xl border border-line bg-surface" />
      ))}
    </div>
  );
}
