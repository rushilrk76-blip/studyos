"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Clock, Plus, TriangleAlert } from "lucide-react";
import type { Task } from "@/lib/homework/types";
import { formatDueDate, getTaskStatus, todayKey } from "@/lib/homework/tasks";
import { SectionTitle } from "@/components/dashboard/section-title";
import { Button } from "@/components/ui/button";

/*
  Combined tasks panel: Today's Tasks (interactive checkboxes),
  Needs Attention (overdue), and Upcoming — all from the same
  Task[] data. Completing a task here updates localStorage.
*/

const PRIORITY_DOT = { High: "bg-ember", Medium: "bg-sun-500", Low: "bg-ink-muted" } as const;

export function TasksPanel({
  todaysTasks,
  overdueTasks,
  upcomingTasks,
  onToggleTask,
}: {
  todaysTasks: Task[];
  overdueTasks: Task[];
  upcomingTasks: Task[];
  onToggleTask: (id: string) => void;
}) {
  const today = todayKey();

  return (
    <div className="space-y-6">
      {/* Today's Tasks — interactive */}
      <section aria-labelledby="today-heading">
        <div className="flex items-end justify-between gap-3">
          <SectionTitle id="today-heading" title="Today's Tasks" />
          {todaysTasks.length > 0 && (
            <Link href="/homework" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-pine-600 hover:text-pine-700">
              View all <ArrowRight className="size-4" />
            </Link>
          )}
        </div>

        {todaysTasks.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-line bg-surface px-6 py-10 text-center">
          <p className="font-semibold text-ink">No tasks for today</p>
          <p className="mt-1 text-sm text-ink-soft">You&apos;re all caught up.</p>
            <Button href="/homework" className="mt-4">
              <Plus className="size-4" /> Add Task
            </Button>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {todaysTasks.map((task) => (
              <TaskRow key={task.id} task={task} today={today} onToggle={() => onToggleTask(task.id)} />
            ))}
          </ul>
        )}
      </section>

      {/* Needs Attention — overdue */}
      {overdueTasks.length > 0 && (
        <section aria-labelledby="overdue-heading">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-ember/10 text-ember">
              <TriangleAlert className="size-4" />
            </span>
            <h2 id="overdue-heading" className="text-lg font-semibold tracking-tight text-ink">
              Needs Attention
            </h2>
            <span className="rounded-full bg-ember/10 px-2 py-0.5 text-xs font-bold text-ember">
              {overdueTasks.length} overdue
            </span>
          </div>
          <ul className="mt-3 space-y-2">
            {overdueTasks.slice(0, 3).map((task) => (
              <TaskRow key={task.id} task={task} today={today} onToggle={() => onToggleTask(task.id)} />
            ))}
          </ul>
        </section>
      )}

      {/* Upcoming */}
      {upcomingTasks.length > 0 && (
        <section aria-labelledby="upcoming-heading">
          <SectionTitle id="upcoming-heading" title="Upcoming" />
          <ul className="mt-4 space-y-1.5">
            {upcomingTasks.map((task) => (
              <li key={task.id}>
                <Link
                  href="/homework"
                  className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-2.5 transition-colors hover:bg-canvas/50"
                >
                  <Clock className="size-4 shrink-0 text-ink-muted" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{task.title}</span>
                    <span className="text-xs text-ink-muted">{task.subject} · {formatDueDate(task.dueDate, today)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function TaskRow({ task, today, onToggle }: { task: Task; today: string; onToggle: () => void }) {
  const done = task.completed;
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
          done ? "border-line/60 bg-canvas/30" : "border-line bg-surface hover:bg-canvas/50"
        }`}
      >
        <span
          className={`grid size-5 shrink-0 place-items-center rounded-md border-2 transition-all ${
            done ? "border-pine-600 bg-pine-600" : "border-line"
          }`}
        >
          {done && <Check className="size-3.5 text-white" strokeWidth={3.5} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-sm ${done ? "text-ink-muted line-through" : "font-medium text-ink"}`}>
            {task.title}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-ink-muted">
            <span className={`size-1.5 rounded-full ${PRIORITY_DOT[task.priority]}`} />
            {task.subject}
          </span>
        </span>
        <span className={`shrink-0 text-xs font-medium ${getTaskStatus(task, today) === "overdue" ? "text-ember" : "text-ink-muted"}`}>
          {formatDueDate(task.dueDate, today)}
        </span>
      </button>
    </li>
  );
}
