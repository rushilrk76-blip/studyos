"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
  reminderService,
  type NotificationPermissionState,
  type NotificationSettings as Settings,
} from "@/services";

/*
  Notification settings.

  Permission is requested ONLY when the student explicitly turns
  a reminder toggle on — never on page load.

  Clearly distinguishes browser reminders (local, tab must be
  open) from cloud push notifications (requires a backend, not
  implemented yet).
*/

const PERMISSION_LABEL: Record<NotificationPermissionState, string> = {
  granted: "Allowed",
  denied: "Blocked",
  default: "Not requested",
  unsupported: "Not supported on this device",
};

export function NotificationSettings() {
  const [settings, setSettings] = useState<Settings>({
    studyReminders: false,
    taskReminders: false,
    sound: false,
  });
  const [permission, setPermission] =
    useState<NotificationPermissionState>("default");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setSettings(reminderService.getSettings());
      setPermission(reminderService.getPermission());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  async function toggle(key: keyof Settings) {
    const next = { ...settings, [key]: !settings[key] };

    /* Turning a reminder ON → request permission explicitly. */
    if (
      !settings[key] &&
      (key === "studyReminders" || key === "taskReminders")
    ) {
      if (!reminderService.isSupported()) {
        setPermission("unsupported");
        return;
      }
      if (reminderService.getPermission() === "default") {
        const result = await reminderService.requestPermission();
        setPermission(result);
        if (result !== "granted") return; // don't enable if denied
      } else if (reminderService.getPermission() === "denied") {
        setPermission("denied");
        return;
      }
    }

    setSettings(next);
    reminderService.saveSettings(next);
  }

  const supported = permission !== "unsupported";

  return (
    <section className="rounded-3xl border border-line bg-surface p-6 sm:p-7">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-xl bg-pine-50 text-pine-600">
          <Bell className="size-5" />
        </span>
        <h2 className="text-base font-bold tracking-tight text-ink">
          Notifications
        </h2>
      </div>

      <div className="space-y-3">
        <Toggle
          label="Study reminders"
          description="Remind me about planned study sessions."
          checked={settings.studyReminders}
          disabled={!supported}
          onChange={() => toggle("studyReminders")}
        />
        <Toggle
          label="Task reminders"
          description="Remind me before a task is due."
          checked={settings.taskReminders}
          disabled={!supported}
          onChange={() => toggle("taskReminders")}
        />
        <Toggle
          label="Reminder sound"
          description="Play a sound with notifications."
          checked={settings.sound}
          disabled={!supported || permission !== "granted"}
          onChange={() => toggle("sound")}
        />

        {/* permission status */}
        <div className="flex items-center justify-between rounded-xl border border-line bg-canvas/40 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-ink">Browser notifications</p>
            <p className="text-xs text-ink-muted">Permission status</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              permission === "granted"
                ? "bg-pine-50 text-pine-700"
                : permission === "denied"
                  ? "bg-ember/10 text-ember"
                  : "border border-line text-ink-soft"
            }`}
          >
            {PERMISSION_LABEL[permission]}
          </span>
        </div>

        {/* honest limitation note */}
        <p className="rounded-xl border border-line bg-canvas/40 px-4 py-3 text-xs leading-relaxed text-ink-muted">
          These are <strong className="text-ink-soft">browser reminders</strong> —
          they only appear while StudyOS is open in a browser tab. They are not
          cloud push notifications and won&apos;t reach you if the browser is
          closed or the device is offline. Cloud notifications will arrive with
          a future update.
        </p>
      </div>
    </section>
  );
}

function Toggle({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-canvas/40 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-xs text-ink-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-40 ${
          checked ? "bg-pine-600" : "bg-line"
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
