"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { todayKey } from "@/lib/homework/tasks";
import type { Task } from "@/lib/homework/types";

/*
  A clean, mobile-usable monthly calendar.
  Days with tasks show a small dot. Clicking a date selects it.
  Keyboard accessible: each day is a real button.
*/
export function PlannerCalendar({
  tasks,
  selectedDate,
  onSelectDate,
}: {
  tasks: Task[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}) {
  const today = todayKey();
  const [viewDate, setViewDate] = useState(() => {
    const [y, m] = selectedDate.split("-").map(Number);
    return new Date(y || new Date().getFullYear(), (m || 1) - 1, 1);
  });

  const datesWithTasks = useMemo(() => {
    const map = new Map<string, number>();
    for (const task of tasks) {
      if (task.completed) continue;
      map.set(task.dueDate, (map.get(task.dueDate) ?? 0) + 1);
    }
    return map;
  }, [tasks]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthLabel = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(viewDate);

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function keyFor(day: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  return (
    <div className="rounded-3xl border border-line bg-surface p-4 sm:p-5">
      {/* month nav */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          aria-label="Previous month"
          className="grid size-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-ink/5"
        >
          <ChevronLeft className="size-5" />
        </button>
        <p className="font-semibold text-ink">{monthLabel}</p>
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          aria-label="Next month"
          className="grid size-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-ink/5"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* weekday headers */}
      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="text-[11px] font-bold uppercase text-ink-muted">
            {d}
          </span>
        ))}
      </div>

      {/* days */}
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <span key={`empty-${i}`} />;
          const key = keyFor(day);
          const count = datesWithTasks.get(key) ?? 0;
          const isToday = key === today;
          const isSelected = key === selectedDate;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(key)}
              aria-label={`${day} ${monthLabel}${count > 0 ? `, ${count} task${count === 1 ? "" : "s"}` : ""}`}
              aria-pressed={isSelected}
              className={`relative grid aspect-square place-items-center rounded-xl text-sm transition-colors ${
                isSelected
                  ? "bg-pine-600 font-bold text-white"
                  : isToday
                    ? "bg-pine-50 font-bold text-pine-700"
                    : "text-ink-soft hover:bg-canvas"
              }`}
            >
              {day}
              {count > 0 && (
                <span
                  className={`absolute bottom-1 size-1 rounded-full ${
                    isSelected ? "bg-white" : "bg-pine-600"
                  }`}
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
