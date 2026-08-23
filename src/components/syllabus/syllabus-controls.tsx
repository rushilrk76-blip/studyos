"use client";

import { Search, X } from "lucide-react";
import { SUBJECTS, type Subject } from "@/lib/subjects";
import type { SubjectFilter, TopicFilter } from "@/lib/syllabus/types";

const STATUS_FILTERS: { id: TopicFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "completed", label: "Completed" },
  { id: "not-started", label: "Not Started" },
];

/*
  Search box, status filter chips and a subject filter.
  Purely controlled: the parent view owns all the state.
*/
export function SyllabusControls({
  query,
  filter,
  subjectFilter,
  subjects,
  onQueryChange,
  onFilterChange,
  onSubjectFilterChange,
}: {
  query: string;
  filter: TopicFilter;
  subjectFilter: SubjectFilter;
  /** The subjects in the student's stream. */
  subjects: Subject[];
  onQueryChange: (query: string) => void;
  onFilterChange: (filter: TopicFilter) => void;
  onSubjectFilterChange: (subject: SubjectFilter) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* search */}
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search topics… (e.g. “electro”)"
            aria-label="Search topics"
            className="h-11 w-full rounded-full border border-line bg-surface pl-11 pr-10 text-sm text-ink placeholder:text-ink-muted/70 transition-colors focus:border-pine-600 focus:outline-none focus:ring-2 focus:ring-pine-600/20"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* status filter */}
        <div
          role="group"
          aria-label="Filter topics by status"
          className="flex shrink-0 gap-1 rounded-full border border-line bg-surface p-1"
        >
          {STATUS_FILTERS.map((item) => {
            const active = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onFilterChange(item.id)}
                aria-pressed={active}
                className={`h-9 flex-1 whitespace-nowrap rounded-full px-3.5 text-sm font-medium transition-all duration-150 sm:flex-none ${
                  active
                    ? "bg-pine-600 text-white shadow-[0_6px_14px_-6px_rgba(23,113,83,0.6)]"
                    : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* subject filter */}
      <div
        role="group"
        aria-label="Filter by subject"
        className="flex flex-wrap gap-2"
      >
        <FilterChip
          label="All subjects"
          active={subjectFilter === "all"}
          onClick={() => onSubjectFilterChange("all")}
        />
        {subjects.map((subject) => (
          <FilterChip
            key={subject.id}
            label={SUBJECTS[subject.id].name}
            active={subjectFilter === subject.id}
            onClick={() => onSubjectFilterChange(subject.id)}
          />
        ))}
      </div>
    </div>
  );
}

function FilterChip({
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
      className={`h-8 rounded-full border px-3.5 text-[13px] font-medium transition-colors ${
        active
          ? "border-pine-600 bg-pine-50 text-pine-700"
          : "border-line bg-surface text-ink-soft hover:border-ink/25 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
