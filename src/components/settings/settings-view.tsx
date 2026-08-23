"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CircleAlert,
  Download,
  GraduationCap,
  Info,
  Monitor,
  Moon,
  Pencil,
  Sun,
  TriangleAlert,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import { getBoard, getStream } from "@/lib/student";
import { routes, site } from "@/lib/site";
import { backupService, dataService } from "@/services";
import type { StudyOSBackup } from "@/services";
import { loadTheme, setTheme, type ThemeChoice } from "@/lib/theme";
import { RestoreDialog } from "@/components/settings/restore-dialog";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { useStudent } from "@/components/app/student-context";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/dashboard/section-title";
import { EditProfileForm } from "@/components/profile/edit-profile-form";

/*
  ────────────────────────────────────────────────
  Settings — five sections:

  1. Profile          — edit name / photo
  2. Academic Setup   — board / stream (read-only + warned change)
  3. Appearance       — light / dark / system
  4. Data             — export + clear
  5. About            — version + info

  Every action that touches data goes through confirmation.
  ────────────────────────────────────────────────
*/

export function SettingsView() {
  const router = useRouter();
  const student = useStudent();
  const { toast } = useToast();
  const [editingProfile, setEditingProfile] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmBoardChange, setConfirmBoardChange] = useState(false);
  const [theme, setThemeState] = useState<ThemeChoice>("system");
  const [backupStatus, setBackupStatus] = useState<"idle" | "success">("idle");
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [pendingBackup, setPendingBackup] = useState<StudyOSBackup | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Load the current theme on mount. */
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setThemeState(loadTheme());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  if (student.status !== "ready") {
    return (
      <div className="space-y-4" aria-hidden>
        <span className="block h-40 animate-pulse rounded-3xl border border-line bg-surface" />
        <span className="block h-32 animate-pulse rounded-3xl border border-line bg-surface" />
      </div>
    );
  }

  const { profile, updateProfile } = student;
  const board = getBoard(profile.board);
  const stream = getStream(profile.stream);

  function handleThemeChange(choice: ThemeChoice) {
    setTheme(choice);
    setThemeState(choice);
  }

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file
    if (!file) return;

    try {
      const text = await backupService.readFileAsText(file);
      const parsed: unknown = JSON.parse(text);
      const result = backupService.validateBackup(parsed);

      if (!result.valid) {
        setRestoreError(result.error);
        return;
      }

      setRestoreError(null);
      setPendingBackup(result.backup);
    } catch {
      setRestoreError("Could not read this file. Make sure it's a StudyOS backup.");
    }
  }

  function handleClearData() {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    /* Delegate to the service — only StudyOS keys are removed. */
    dataService.clearAllUserData();
    router.replace(routes.getStarted);
  }

  function handleProfileSave(updates: { name: string; photoDataUrl: string | null }) {
    updateProfile({ ...profile, ...updates });
    setEditingProfile(false);
  }

  return (
    <div className="max-w-2xl space-y-10">
      <SectionTitle
        title="Settings"
        description="Your profile and data, all in one place."
      />

      {/* ── 1. Profile ── */}
      <SettingsSection
        icon={<User className="size-5" />}
        title="Profile"
      >
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-pine-600 text-lg font-bold text-white">
            {profile.photoDataUrl ? (
              <img src={profile.photoDataUrl} alt="" className="size-full object-cover" />
            ) : (
              profile.name.trim()[0]?.toUpperCase() ?? <User className="size-6" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-ink">{profile.name}</p>
            <p className="font-mono text-xs text-ink-muted">{profile.studentId}</p>
          </div>
          <Button variant="secondary" size="md" onClick={() => setEditingProfile(true)}>
            <Pencil className="size-4" />
            Edit
          </Button>
        </div>
      </SettingsSection>

      {/* ── 2. Academic Setup ── */}
      <SettingsSection
        icon={<GraduationCap className="size-5" />}
        title="Academic Setup"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <InfoTile label="Class" value="Class 12" />
          <InfoTile label="Board" value={board.name} />
          <InfoTile label="Stream" value={stream.name} />
        </div>
        <div className="mt-4 rounded-xl border border-sun-400/30 bg-sun-400/5 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-sun-500" />
            <div className="flex-1">
              <p className="text-sm text-ink-soft">
                Changing your board or stream changes your available subjects and
                syllabus. Existing progress for the previous selection may no
                longer apply.
              </p>
              <button
                type="button"
                onClick={() => setConfirmBoardChange(true)}
                className="mt-2 text-sm font-semibold text-pine-600 underline-offset-2 hover:underline"
              >
                Change Board / Stream
              </button>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* ── 3. Appearance ── */}
      <SettingsSection
        icon={<Sun className="size-5" />}
        title="Appearance"
      >
        <div className="grid grid-cols-3 gap-2">
          {([
            { id: "light", label: "Light", icon: Sun },
            { id: "dark", label: "Dark", icon: Moon },
            { id: "system", label: "System", icon: Monitor },
          ] as const).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleThemeChange(option.id)}
              aria-pressed={theme === option.id}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-colors ${
                theme === option.id
                  ? "border-pine-600 bg-pine-50 text-pine-700"
                  : "border-line bg-surface text-ink-soft hover:border-ink/25 hover:text-ink"
              }`}
            >
              <option.icon className="size-5" strokeWidth={2} />
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </SettingsSection>

      {/* ── Notifications ── */}
      <NotificationSettings />

      {/* ── 4. Data & Backup ── */}
      <SettingsSection
        icon={<Download className="size-5" />}
        title="Data & Backup"
      >
        {/* honest local-storage notice */}
        <p className="mb-4 flex items-start gap-2.5 rounded-xl border border-line bg-canvas/50 px-4 py-3 text-xs leading-relaxed text-ink-muted">
          <Info className="mt-0.5 size-3.5 shrink-0 text-pine-600" />
          <span>
            Your current StudyOS data is stored locally on this device.
            Clearing browser data may remove your progress. Use Backup &amp;
            Restore to move your data between devices — cloud sync is not
            available in this version.
          </span>
        </p>
    
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={handleFileSelect}
          />
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-canvas/40 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink">Backup My StudyOS Data</p>
              <p className="text-xs text-ink-muted">
                Save a copy of your progress to a file on this device.
              </p>
            </div>
            <Button variant="secondary" size="md" onClick={() => { backupService.downloadBackup(); setBackupStatus("success"); toast("Backup created — saved on this device."); setTimeout(() => setBackupStatus("idle"), 3000); }}>
              <Download className="size-4" />
              Backup
            </Button>
          </div>
          {backupStatus === "success" && (
            <p className="px-1 text-xs font-medium text-pine-700">
              Backup created. It&apos;s on your device — keep it safe.
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-canvas/40 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink">Restore My Data</p>
              <p className="text-xs text-ink-muted">
                Restore from a StudyOS backup file.
              </p>
            </div>
            <Button variant="secondary" size="md" onClick={() => fileInputRef.current?.click()}>
              <Upload className="size-4" />
              Restore
            </Button>
          </div>
          {restoreError && (
            <p className="flex items-center gap-1.5 rounded-xl border border-ember/25 bg-ember/5 px-4 py-2.5 text-sm text-ember">
              <CircleAlert className="size-4 shrink-0" />
              {restoreError}
            </p>
          )}
          <div className="pt-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Danger Zone</p>
          </div>
          <div className="rounded-xl border border-ember/25 bg-ember/5 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink">Clear My Data</p>
                <p className="text-xs text-ink-muted">
                  Permanently remove all StudyOS data from this browser.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearData}
                className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
                  confirmClear
                    ? "bg-ember text-white hover:bg-ember/90"
                    : "border border-ember/40 text-ember hover:bg-ember/10"
                }`}
              >
                <Trash2 className="size-4" />
                {confirmClear ? "Tap again to confirm" : "Clear"}
              </button>
            </div>
            {confirmClear && (
              <div className="mt-3 flex items-center gap-3">
                <p className="text-xs text-ember">
                  This will permanently remove your StudyOS data and return you to onboarding.
                </p>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="shrink-0 text-xs font-medium text-ink-muted underline-offset-2 hover:underline"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </SettingsSection>

      {/* ── 5. About ── */}
      <SettingsSection
        icon={<Info className="size-5" />}
        title="About"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-muted">App</span>
            <span className="font-medium text-ink">{site.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-muted">Version</span>
            <span className="font-medium text-ink">1.0.0</span>
          </div>
          <p className="pt-2 text-xs leading-relaxed text-ink-muted">
            {site.name} is a personal academic productivity tool for Class 12
            students. Your data is stored locally in your browser — no account,
            no server, no tracking.
          </p>
        </div>
      </SettingsSection>

      {/* ── modals ── */}
      {editingProfile && (
        <EditProfileForm
          profile={profile}
          onSave={handleProfileSave}
          onClose={() => setEditingProfile(false)}
        />
      )}

      {confirmBoardChange && (
        <BoardChangeWarning
          onCancel={() => setConfirmBoardChange(false)}
          onConfirm={() => {
            setConfirmBoardChange(false);
            router.push(routes.getStarted);
          }}
        />
      )}

      {pendingBackup && (
        <RestoreDialog
          backup={pendingBackup}
          onClose={() => setPendingBackup(null)}
        />
      )}
    </div>
  );
}

/* ── shared pieces ── */

function SettingsSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-line bg-surface p-6 sm:p-7">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-xl bg-pine-50 text-pine-600">
          {icon}
        </span>
        <h2 className="text-base font-bold tracking-tight text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-canvas/40 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </p>
      <p className="mt-0.5 font-semibold text-ink">{value}</p>
    </div>
  );
}

function BoardChangeWarning({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="w-full max-w-md animate-step-in rounded-3xl border border-line bg-surface p-6 shadow-2xl sm:p-7">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-sun-400/15 text-sun-500">
          <TriangleAlert className="size-6" />
        </span>
        <h2 className="mt-4 text-center font-display text-xl font-medium text-ink">
          Change Board or Stream?
        </h2>
        <p className="mt-3 text-center text-sm leading-relaxed text-ink-soft">
          Changing your board or stream may change your available subjects and
          syllabus. Existing progress related to the previous selection may no
          longer apply. Your old data is <strong>not deleted</strong> — it stays
          in your browser but may not be visible for the new selection.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" size="lg" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="lg" onClick={onConfirm}>
            Continue to Setup
          </Button>
        </div>
      </div>
    </div>
  );
}
