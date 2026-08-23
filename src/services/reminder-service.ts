import { REMINDER_MINUTES, type Task } from "@/lib/homework/types";

/*
  ────────────────────────────────────────────────
  Reminder service — LOCAL BROWSER REMINDERS ONLY.

  ⚠️ IMPORTANT LIMITATION:
  These are browser Notification API reminders. They only fire
  while StudyOS is open in a browser tab. They are NOT cloud
  push notifications — if the browser is closed, the device is
  off, or notifications are blocked, reminders will not appear.

  True push notifications require a backend + service worker,
  which will come with the Supabase migration.

  Permission is NEVER requested on page load — only when the
  student explicitly enables reminders.
  ────────────────────────────────────────────────
*/

const NOTIF_SETTINGS_KEY = "studyos:notification-settings:v1";
const FIRED_KEY = "studyos:fired-reminders:v1";

export type NotificationPermissionState =
  | "granted"
  | "denied"
  | "default"
  | "unsupported";

export type NotificationSettings = {
  studyReminders: boolean;
  taskReminders: boolean;
  sound: boolean;
};

const DEFAULT_SETTINGS: NotificationSettings = {
  studyReminders: false,
  taskReminders: false,
  sound: false,
};

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/** Computes the exact Date a task's reminder should fire. */
function reminderTime(task: Task): Date | null {
  if (!task.reminder || task.reminder === "None") return null;
  if (!task.dueDate) return null;

  const minutes = REMINDER_MINUTES[task.reminder];
  if (minutes === null) return null;

  /* Without a time, treat "1 day before" as 9am the previous day. */
  const time = task.dueTime ?? "09:00";
  const target = new Date(`${task.dueDate}T${time}:00`);
  if (Number.isNaN(target.getTime())) return null;

  target.setMinutes(target.getMinutes() - minutes);
  return target;
}

export const reminderService = {
  /* ── Permission ── */
  getPermission(): NotificationPermissionState {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    return Notification.permission as NotificationPermissionState;
  },

  isSupported(): boolean {
    return typeof window !== "undefined" && "Notification" in window;
  },

  /**
   * Requests permission — ONLY call this from an explicit user
   * action (e.g. toggling reminders on). Never on page load.
   */
  async requestPermission(): Promise<NotificationPermissionState> {
    if (!this.isSupported()) return "unsupported";
    try {
      const result = await Notification.requestPermission();
      return result as NotificationPermissionState;
    } catch {
      return "denied";
    }
  },

  /* ── Settings ── */
  getSettings(): NotificationSettings {
    return readJSON(NOTIF_SETTINGS_KEY, DEFAULT_SETTINGS);
  },

  saveSettings(settings: NotificationSettings): void {
    writeJSON(NOTIF_SETTINGS_KEY, settings);
  },

  /* ── Pending reminders ── */
  /** Tasks with a reminder that hasn't fired and is due to fire. */
  getPendingReminders(tasks: Task[], now: Date = new Date()): Task[] {
    const fired = new Set(readJSON<string[]>(FIRED_KEY, []));
    return tasks.filter((task) => {
      if (task.completed) return false;
      if (fired.has(task.id)) return false;
      const time = reminderTime(task);
      if (!time) return false;
      /* Fire if the reminder time has passed but within the last hour. */
      const diff = now.getTime() - time.getTime();
      return diff >= 0 && diff < 60 * 60 * 1000;
    });
  },

  /** Shows a browser notification for a task. */
  showReminder(task: Task): boolean {
    if (this.getPermission() !== "granted") return false;
    const settings = this.getSettings();
    if (!settings.taskReminders) return false;

    try {
      new Notification(`StudyOS · ${task.subject}`, {
        body: task.title,
        tag: task.id,
        silent: !settings.sound,
      });
      this.markFired(task.id);
      return true;
    } catch {
      return false;
    }
  },

  /** Records that a reminder has fired so it doesn't repeat. */
  markFired(taskId: string): void {
    const fired = readJSON<string[]>(FIRED_KEY, []);
    if (!fired.includes(taskId)) {
      /* Keep the list bounded. */
      writeJSON(FIRED_KEY, [taskId, ...fired].slice(0, 200));
    }
  },

  /** Clears the fired record for a task (e.g. when rescheduled). */
  cancelReminder(taskId: string): void {
    const fired = readJSON<string[]>(FIRED_KEY, []);
    writeJSON(
      FIRED_KEY,
      fired.filter((id) => id !== taskId),
    );
  },

  /**
   * Checks all tasks and fires any due reminders.
   * Called on an interval by the app shell (once a minute — light).
   */
  checkAndFire(tasks: Task[]): number {
    if (this.getPermission() !== "granted") return 0;
    const pending = this.getPendingReminders(tasks);
    let fired = 0;
    for (const task of pending) {
      if (this.showReminder(task)) fired++;
    }
    return fired;
  },
};
