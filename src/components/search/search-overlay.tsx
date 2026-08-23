"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, SearchX, X, Clock, ArrowRight } from "lucide-react";
import type { StudentProfile } from "@/lib/student";
import {
  buildSearchIndex,
  searchStudyOS,
  groupByCategory,
  getAvailableCategories,
  getAvailableSubjects,
  CATEGORY_LABELS,
  type SearchCategory,
  type SearchResult,
} from "@/lib/search";
import type { Task } from "@/lib/homework/types";
import type { ExamResult } from "@/lib/marks/types";
import type { Certificate, Project } from "@/lib/portfolio/types";

/*
  ────────────────────────────────────────────────
  Global search overlay.

  Opens via Ctrl/Cmd+K or the header search trigger.
  Searches across all StudyOS data — syllabus, practice,
  homework, marks, portfolio. Results are grouped by
  category, keyboard-navigable, and navigate on click.

  READ-ONLY: search never modifies any data.
  ────────────────────────────────────────────────
*/

const RECENT_KEY = "studyos:recent-searches:v1";
const MAX_RECENT = 6;

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecent(query: string) {
  if (typeof window === "undefined") return;
  try {
    const current = loadRecent().filter((q) => q !== query);
    const updated = [query, ...current].slice(0, MAX_RECENT);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    /* ignore */
  }
}

export function SearchOverlay({
  profile,
  tasks,
  results,
  projects,
  certificates,
  onClose,
}: {
  profile: StudentProfile;
  tasks: Task[];
  results: ExamResult[];
  projects: Project[];
  certificates: Certificate[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState<SearchCategory[]>([]);
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [recent, setRecent] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const availableCategories = useMemo(
    () => getAvailableCategories(profile.stream),
    [profile.stream],
  );
  const availableSubjects = useMemo(
    () => getAvailableSubjects(profile.stream),
    [profile.stream],
  );

  /* Build the index once per mount. */
  const index = useMemo(
    () =>
      buildSearchIndex({
        board: profile.board,
        stream: profile.stream,
        tasks,
        results,
        projects,
        certificates,
      }),
    [profile.board, profile.stream, tasks, results, projects, certificates],
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setRecent(loadRecent());
      inputRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  /* Keyboard navigation. */
  const flatResults = useMemo(() => {
    return searchStudyOS(index, query, {
      categories: activeCategories,
      subject: subjectFilter,
    });
  }, [index, query, activeCategories, subjectFilter]);

  const grouped = useMemo(() => groupByCategory(flatResults), [flatResults]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setActiveIndex(0));
    return () => cancelAnimationFrame(frame);
  }, [query, activeCategories, subjectFilter]);

  const navigate = useCallback(
    (href: string) => {
      if (query.trim()) {
        saveRecent(query.trim());
      }
      router.push(href);
      onClose();
    },
    [query, router, onClose],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (event.key === "Enter" && flatResults[activeIndex]) {
        event.preventDefault();
        navigate(flatResults[activeIndex].href);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [flatResults, activeIndex, navigate, onClose]);

  const showRecent = !query && recent.length > 0;
  const showQuickAccess = !query && recent.length === 0;
  const showNoResults = query.trim() && flatResults.length === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 backdrop-blur-sm sm:pt-[10vh]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-line bg-surface shadow-2xl sm:rounded-3xl">
        {/* search input */}
        <div className="flex items-center gap-3 border-b border-line/70 px-4 py-3.5 sm:px-5">
          <Search className="size-5 shrink-0 text-ink-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search syllabus, topics, homework, practice…"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder:text-ink-muted/70 focus:outline-none"
            aria-label="Search StudyOS"
            autoComplete="off"
          />
          <kbd className="hidden shrink-0 rounded-md border border-line bg-canvas px-2 py-0.5 text-[10px] font-semibold text-ink-muted sm:block">
            ESC
          </kbd>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="grid size-8 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink sm:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* filters */}
        <div className="flex flex-wrap gap-1.5 border-b border-line/70 px-4 py-2.5 sm:px-5">
          <FilterChip
            label="All"
            active={activeCategories.length === 0}
            onClick={() => setActiveCategories([])}
          />
          {availableCategories.map((cat) => (
            <FilterChip
              key={cat}
              label={CATEGORY_LABELS[cat]}
              active={activeCategories.includes(cat)}
              onClick={() =>
                setActiveCategories((prev) =>
                  prev.includes(cat)
                    ? prev.filter((c) => c !== cat)
                    : [...prev, cat],
                )
              }
            />
          ))}
          <div className="ml-auto flex items-center gap-1.5">
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              aria-label="Filter by subject"
              className="h-8 rounded-full border border-line bg-surface px-3 text-xs font-medium text-ink-soft focus:border-pine-600 focus:outline-none"
            >
              <option value="all">All subjects</option>
              {availableSubjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {/* recent searches */}
          {showRecent && (
            <div className="mb-4">
              <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                Recent
              </p>
              <div className="flex flex-wrap gap-1.5">
                {recent.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas/50 px-3 py-1.5 text-sm text-ink-soft transition-colors hover:bg-canvas"
                  >
                    <Clock className="size-3" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* quick access */}
          {showQuickAccess && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <QuickLink label="Dashboard" href="/dashboard" onNavigate={navigate} />
              <QuickLink label="Syllabus" href="/syllabus" onNavigate={navigate} />
              <QuickLink label="Homework" href="/homework" onNavigate={navigate} />
              <QuickLink label="Marks" href="/marks" onNavigate={navigate} />
              <QuickLink label="Practice" href="/practice" onNavigate={navigate} />
              <QuickLink label="Portfolio" href="/portfolio" onNavigate={navigate} />
            </div>
          )}

          {/* no results */}
          {showNoResults && (
            <div className="py-12 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-canvas text-ink-muted">
                <SearchX className="size-6" strokeWidth={1.8} />
              </span>
              <p className="mt-3 font-semibold text-ink">No results found</p>
              <p className="mt-1 text-sm text-ink-soft">
                Try searching for a chapter, topic, homework, or test.
              </p>
            </div>
          )}

          {/* results */}
          {flatResults.length > 0 && (
            <div className="space-y-5">
              {grouped.map(({ category, items }) => (
                <div key={category}>
                  <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                    {CATEGORY_LABELS[category]}
                  </p>
                  <div className="space-y-0.5">
                    {items.map((result) => {
                      const flatIdx = flatResults.indexOf(result);
                      const active = flatIdx === activeIndex;
                      return (
                        <ResultRow
                          key={result.id}
                          result={result}
                          active={active}
                          onClick={() => navigate(result.href)}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── pieces ── */

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
      className={`h-8 rounded-full border px-3 text-xs font-medium transition-colors ${
        active
          ? "border-pine-600 bg-pine-50 text-pine-700"
          : "border-line bg-surface text-ink-soft hover:border-ink/25 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function QuickLink({
  label,
  href,
  onNavigate,
}: {
  label: string;
  href: string;
  onNavigate: (href: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(href)}
      className="flex items-center justify-between gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-canvas/50"
    >
      {label}
      <ArrowRight className="size-4 text-ink-muted" />
    </button>
  );
}

function ResultRow({
  result,
  active,
  onClick,
}: {
  result: SearchResult;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
        active ? "bg-pine-50" : "hover:bg-canvas/50"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{result.title}</p>
        <p className="truncate text-xs text-ink-muted">
          {result.subject} · {result.subtitle}
        </p>
      </div>
      <ArrowRight className="size-4 shrink-0 text-ink-muted" />
    </button>
  );
}
