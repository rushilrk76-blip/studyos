import { STORAGE_KEYS } from "@/lib/data-keys";

/*
  ────────────────────────────────────────────────
  Theme persistence (Light / Dark / System).

  The actual theme application happens via:
  1. An inline <script> in layout.tsx that runs BEFORE
     React hydrates — preventing a flash of wrong theme.
  2. CSS variable overrides in globals.css scoped to
     [data-theme="dark"].

  This module just stores the preference and toggles
  the attribute for live switching.
  ────────────────────────────────────────────────
*/

export type ThemeChoice = "light" | "dark" | "system";

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(choice: ThemeChoice) {
  if (typeof document === "undefined") return;
  const isDark = choice === "dark" || (choice === "system" && systemPrefersDark());
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
}

export function loadTheme(): ThemeChoice {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.theme);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return "system";
}

export function setTheme(choice: ThemeChoice) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.theme, choice);
  } catch {
    /* ignore */
  }
  applyTheme(choice);
}

/**
 * Initialises the theme on first client render.
 * Call once in a top-level client component.
 */
export function initTheme() {
  applyTheme(loadTheme());

  /* Respond to OS theme changes when in "system" mode. */
  if (typeof window !== "undefined") {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", () => {
      if (loadTheme() === "system") applyTheme("system");
    });
  }
}
