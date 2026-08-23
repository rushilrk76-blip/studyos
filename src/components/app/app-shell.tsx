"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Award,
  BookOpenCheck,
  CalendarDays,
  CircleUserRound,
  LayoutDashboard,
  NotebookPen,
  Search,
  Settings,
  Sigma,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { routes } from "@/lib/site";
import { generateStudentId, getBoard, getStream, type StudentProfile } from "@/lib/student";
import { getGreeting } from "@/lib/dashboard";
import { studentService } from "@/services";
import { Logo } from "@/components/layout/logo";
import {
  StudentContext,
  type StudentState,
} from "@/components/app/student-context";
import { initTheme } from "@/lib/theme";
import { taskService, examService, portfolioService, reminderService } from "@/services";
import { SearchOverlay } from "@/components/search/search-overlay";
import { ToastProvider } from "@/components/ui/toast";
import { UserMenu } from "@/components/app/user-menu";

/*
  ────────────────────────────────────────────────
  The frame around every app page (/dashboard, /syllabus…)

  Responsibilities:
  1. Read the saved profile from localStorage — once.
  2. No profile? Send the visitor to onboarding instead.
  3. Provide the profile via StudentContext to all pages.
  4. Render navigation: sidebar on desktop, bottom tabs
     on mobile, header with greeting on all sizes.
  ────────────────────────────────────────────────
*/

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/syllabus", label: "Syllabus", icon: BookOpenCheck },
  { href: "/planner", label: "Planner", icon: CalendarDays },
  { href: "/homework", label: "Homework", icon: NotebookPen },
  { href: "/marks", label: "Marks", icon: TrendingUp },
  { href: "/portfolio", label: "Portfolio", icon: Award },
];

/*
  Practice covers Physics + Chemistry (all streams) and Maths
  (PCM/PCMB only), so every student sees this item.
*/
const PRACTICE_ITEM: NavItem = {
  href: "/practice",
  label: "Practice",
  icon: Sigma,
};

const SETTINGS_ITEM: NavItem = {
  href: "/settings",
  label: "Settings",
  icon: Settings,
};

const PROFILE_ITEM: NavItem = {
  href: "/profile",
  label: "Profile",
  icon: CircleUserRound,
};

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<StudentState>({ status: "loading" });
  const [now, setNow] = useState<Date | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  /*
    Read storage + clock only on the client (after hydration).
    No profile → this person hasn't completed onboarding, so we
    send them there instead of showing an empty dashboard.
  */
  /* Theme: initialise once on mount. */
  useEffect(() => {
    initTheme();
  }, []);

  /*
    Reminder checking — once a minute while the app is open.
    Lightweight: only reads tasks and compares timestamps.
    Browser reminders only fire while StudyOS is open in a tab.
  */
  useEffect(() => {
    if (state.status !== "ready") return;
    function check() {
      reminderService.checkAndFire(taskService.getTasks());
    }
    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [state.status]);

  /* Keyboard shortcut: Ctrl/Cmd+K opens search. */
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        if (state.status === "ready") setSearchOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [state.status]);

  const updateProfile = useCallback((updated: StudentProfile) => {
    studentService.saveProfile(updated);
    /* Functional update keeps updateProfile stable — avoids self-reference. */
    setState((prev) =>
      prev.status === "ready" ? { ...prev, profile: updated } : prev,
    );
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const profile = studentService.getProfile();
      if (!profile) {
        router.replace(routes.getStarted);
        return;
      }
      /* Ensure a stable student ID exists (backfills older profiles). */
      const withId = studentService.ensureStudentId(profile);
      setState({
        status: "ready",
        profile: withId,
        updateProfile,
      });
      setNow(new Date());
    });
    return () => cancelAnimationFrame(frame);
  }, [router, updateProfile]);

  const profile = state.status === "ready" ? state.profile : null;
  const board = profile ? getBoard(profile.board) : null;
  const stream = profile ? getStream(profile.stream) : null;
  const firstName = profile?.name.trim().split(/\s+/)[0] ?? "";

  /*
    Practice is available to every stream (Physics + Chemistry are
    common; Maths is added inside the practice hub for PCM/PCMB).
  */
  const sidebarItems = [
    ...NAV_ITEMS.slice(0, 2),
    PRACTICE_ITEM,
    ...NAV_ITEMS.slice(2),
    PROFILE_ITEM,
    SETTINGS_ITEM,
  ];
  /*
    Bottom bar shows core daily tabs. NAV_ITEMS is
    [Dashboard, Syllabus, Planner, Homework, Marks, Portfolio].
    Mobile: Dashboard, Syllabus, Practice, Planner, Homework, Marks.
    Portfolio/Profile live in the user menu on phones (space is tight).
  */
  const mobileItems = [
    ...NAV_ITEMS.slice(0, 2),
    PRACTICE_ITEM,
    ...NAV_ITEMS.slice(2, 5),
  ];

  return (
    <StudentContext.Provider value={state}>
      <ToastProvider>
      <div className="min-h-screen bg-canvas">
        {/* ── Desktop sidebar ─────────────────────────── */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line/70 bg-canvas lg:flex">
          <div className="flex h-16 items-center border-b border-line/60 px-5">
            <Logo />
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="App">
            {sidebarItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-pine-50 font-semibold text-pine-700"
                      : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  <item.icon className="size-[18px]" strokeWidth={2} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* mini profile card */}
          <div className="border-t border-line/60 p-3">
            {profile ? (
              <Link
                href="/settings"
                className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-ink/5"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-pine-600 text-xs font-bold text-white">
                  {firstName[0]?.toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">
                    {profile.name}
                  </span>
                  <span className="block truncate text-xs text-ink-muted">
                    {board?.name} · {stream?.name}
                  </span>
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-3 px-2.5 py-2.5">
                <span className="size-9 animate-pulse rounded-full bg-line" />
                <span className="h-4 w-24 animate-pulse rounded bg-line" />
              </div>
            )}
          </div>
        </aside>

        {/* ── Main column ─────────────────────────────── */}
        <div className="lg:pl-64">
          {/* Header */}
          <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/85 backdrop-blur-md">
            <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
              {/* left: logo on mobile, greeting on desktop */}
              <div className="flex items-center gap-3 lg:hidden">
                <Logo />
              </div>
              <div className="hidden min-w-0 lg:block">
                {profile && now ? (
                  <>
                    <h1 className="truncate text-[15px] font-semibold tracking-tight text-ink">
                      {getGreeting(now)},{" "}
                      <span className="font-display italic text-pine-700">
                        {firstName}
                      </span>
                    </h1>
                    <p className="text-xs text-ink-muted">
                      {new Intl.DateTimeFormat("en-IN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      }).format(now)}
                    </p>
                  </>
                ) : (
                  <span className="block h-5 w-44 animate-pulse rounded bg-line" />
                )}
              </div>

              {/* right: search + badges + avatar */}
              <div className="flex items-center gap-2">
                {/* Search trigger */}
                {profile && (
                  <>
                    <button
                      type="button"
                      onClick={() => setSearchOpen(true)}
                      className="hidden items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink-muted transition-colors hover:border-pine-200 hover:bg-canvas md:flex"
                      aria-label="Search"
                    >
                      <Search className="size-4" />
                      <span>Search…</span>
                      <kbd className="ml-2 rounded border border-line bg-canvas px-1.5 py-0.5 text-[10px] font-semibold">⌘K</kbd>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchOpen(true)}
                      className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink md:hidden"
                      aria-label="Search"
                    >
                      <Search className="size-5" />
                    </button>
                  </>
                )}
                {board && stream ? (
                  <div className="hidden items-center gap-1.5 sm:flex">
                    <span className="rounded-full border border-pine-200 bg-pine-50 px-3 py-1 text-xs font-bold text-pine-700">
                      {board.name}
                    </span>
                    <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-ink-soft">
                      {stream.name}
                    </span>
                  </div>
                ) : (
                  <span className="hidden h-6 w-20 animate-pulse rounded-full bg-line sm:block" />
                )}
                {profile ? (
                  <UserMenu profile={profile} />
                ) : (
                  <span className="size-9 animate-pulse rounded-full bg-line" />
                )}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="mx-auto w-full max-w-6xl px-5 pb-28 pt-8 sm:px-8 lg:pb-14">
            {children}
          </main>
        </div>

        {/* ── Mobile bottom tabs ──────────────────────── */}
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-canvas/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
          aria-label="App"
        >
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${mobileItems.length}, minmax(0, 1fr))`,
            }}
          >
            {mobileItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 py-2.5 transition-colors ${
                    active ? "text-pine-700" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  <item.icon className="size-5" strokeWidth={active ? 2.2 : 2} />
                  <span
                    className={`text-[10px] leading-none ${
                      active ? "font-bold" : "font-medium"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`mt-0.5 h-1 w-1 rounded-full transition-colors ${
                      active ? "bg-pine-600" : "bg-transparent"
                    }`}
                    aria-hidden
                  />
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Global search overlay */}
      {searchOpen && profile && (
        <SearchOverlay
          profile={profile}
          tasks={taskService.getTasks()}
          results={examService.getResults()}
          projects={portfolioService.getProjects()}
          certificates={portfolioService.getCertificates()}
          onClose={() => setSearchOpen(false)}
        />
      )}
      </ToastProvider>
    </StudentContext.Provider>
  );
}
