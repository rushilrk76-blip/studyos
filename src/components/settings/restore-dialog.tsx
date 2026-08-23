"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Download, Upload, X } from "lucide-react";
import type { StudyOSBackup, RestoreSummary } from "@/services/backup-service";
import { backupService } from "@/services";
import { studentService } from "@/services";
import { Button } from "@/components/ui/button";

/*
  Restore confirmation + result dialog.

  Flow:
  1. Show current data vs backup comparison → confirm.
  2. On confirm: restoreBackup() → atomic write with rollback.
  3. Show success summary (or error).
  4. On dismiss: reload the app so all pages pick up the new data.
*/

export function RestoreDialog({
  backup,
  onClose,
}: {
  backup: StudyOSBackup;
  onClose: () => void;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<"confirm" | "success" | "error">("confirm");
  const [result, setResult] = useState<RestoreSummary | null>(null);

  /* Current data for comparison. */
  const current = studentService.getProfile();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && phase !== "success") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [phase, onClose]);

  function handleRestore() {
    const summary = backupService.restoreBackup(backup);
    setResult(summary);
    setPhase(summary.success ? "success" : "error");
  }

  function handleDismiss() {
    if (phase === "success") {
      /* Reload to onboarding or dashboard — the app decides based on new profile. */
      window.location.href = "/";
    } else {
      onClose();
    }
  }

  const backupName = backup.student?.name ?? "Unknown";
  const backupBoard = backup.student?.board?.toUpperCase() ?? "—";
  const backupStream = backup.student?.stream?.toUpperCase() ?? "—";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[92vh] w-full max-w-lg animate-step-in overflow-y-auto rounded-t-3xl border border-line bg-surface p-6 shadow-2xl sm:rounded-3xl sm:p-7">
        {/* ── Confirm phase ── */}
        {phase === "confirm" && (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-pine-50 text-pine-600">
                  <Upload className="size-5" />
                </span>
                <h2 className="font-display text-xl font-medium tracking-tight text-ink">
                  Restore Backup
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid size-9 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="mt-4 rounded-xl border border-sun-400/30 bg-sun-400/5 px-4 py-3 text-sm text-ink-soft">
              Restoring this backup will <strong>replace</strong> your current
              StudyOS data on this device.
            </p>

            {/* comparison */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-canvas/40 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                  Current
                </p>
                <p className="mt-1.5 text-sm font-semibold text-ink">
                  {current?.name ?? "No profile"}
                </p>
                <p className="text-xs text-ink-muted">
                  {current ? `${current.board.toUpperCase()} · ${current.stream.toUpperCase()}` : "—"}
                </p>
              </div>
              <div className="rounded-2xl border border-pine-200 bg-pine-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-pine-700">
                  Backup
                </p>
                <p className="mt-1.5 text-sm font-semibold text-ink">{backupName}</p>
                <p className="text-xs text-ink-muted">{backupBoard} · {backupStream}</p>
              </div>
            </div>

            {/* backup contents */}
            <div className="mt-4 space-y-1.5 text-sm">
              <Row label="Syllabus topics" value={countKeys(backup.syllabusProgress)} />
              <Row label="Practice questions" value={countKeys(backup.practiceProgress) + countKeys(backup.sciencePractice)} />
              <Row label="Homework tasks" value={backup.tasks.length} />
              <Row label="Exam results" value={backup.examResults.length} />
              <Row label="Projects" value={backup.projects.length} />
              <Row label="Certificates" value={backup.certificates.length} />
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 border-t border-line/70 pt-5 sm:flex-row sm:justify-end">
              <Button variant="secondary" size="lg" onClick={onClose}>
                Cancel
              </Button>
              <Button size="lg" onClick={handleRestore}>
                <Upload className="size-4" />
                Restore Backup
              </Button>
            </div>
          </>
        )}

        {/* ── Success phase ── */}
        {phase === "success" && result && (
          <>
            <div className="flex flex-col items-center text-center">
              <span className="grid size-14 animate-pop place-items-center rounded-full bg-pine-600 text-white">
                <CheckCircle2 className="size-7" />
              </span>
              <h2 className="mt-4 font-display text-2xl font-medium tracking-tight text-ink">
                Restore Complete
              </h2>
              <p className="mt-2 text-sm text-ink-soft">
                Your StudyOS data has been restored successfully.
              </p>
            </div>

            <div className="mt-5 space-y-1.5 text-sm">
              <Row label="Student" value={result.student?.name ?? "—"} />
              <Row label="Board" value={result.student?.board?.toUpperCase() ?? "—"} />
              <Row label="Stream" value={result.student?.stream?.toUpperCase() ?? "—"} />
              <div className="my-2 border-t border-line/60" />
              <Row label="Syllabus topics restored" value={result.syllabusTopics} />
              <Row label="Practice questions restored" value={result.practiceQuestions} />
              <Row label="Homework tasks restored" value={result.homeworkTasks} />
              <Row label="Exam results restored" value={result.examResults} />
              <Row label="Projects restored" value={result.projects} />
              <Row label="Certificates restored" value={result.certificates} />
            </div>

            {result.skippedRecords > 0 && (
              <p className="mt-4 rounded-xl border border-sun-400/30 bg-sun-400/5 px-4 py-3 text-sm text-ink-soft">
                {result.skippedRecords} record{result.skippedRecords === 1 ? "" : "s"} could
                not be matched with the current StudyOS version.
              </p>
            )}

            <div className="mt-6 flex justify-center">
              <Button size="lg" onClick={handleDismiss}>
                Continue to StudyOS
              </Button>
            </div>
          </>
        )}

        {/* ── Error phase ── */}
        {phase === "error" && (
          <>
            <div className="flex flex-col items-center text-center">
              <span className="grid size-14 place-items-center rounded-full bg-ember/10 text-ember">
                <X className="size-7" />
              </span>
              <h2 className="mt-4 font-display text-2xl font-medium tracking-tight text-ink">
                Restore Failed
              </h2>
              <p className="mt-2 text-sm text-ink-soft">
                {result?.error ?? "Something went wrong. Your data was not changed."}
              </p>
            </div>
            <div className="mt-6 flex justify-center">
              <Button variant="secondary" size="lg" onClick={handleDismiss}>
                Close
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-ink-muted">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}

function countKeys(obj: Record<string, unknown>): number {
  return Object.keys(obj).length;
}
