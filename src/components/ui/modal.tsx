"use client";

import { useEffect, type ReactNode } from "react";
import { X, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/*
  Shared modal shell used by every form overlay in StudyOS:
  task form, result form, planner form, profile editor,
  project/certificate forms.

  One implementation = consistent spacing, scrolling,
  backdrop dismissal, Escape-to-close, and mobile bottom-sheet
  layout instead of each page re-inventing it.
*/
export function ModalShell({
  title,
  onClose,
  maxWidth = "max-w-lg",
  children,
}: {
  title: string;
  onClose: () => void;
  maxWidth?: string;
  children: ReactNode;
}) {
  /* Lock body scroll while open + Escape to close. */
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`max-h-[92vh] w-full ${maxWidth} animate-step-in overflow-y-auto rounded-t-3xl border border-line bg-surface p-6 shadow-2xl sm:rounded-3xl sm:p-7`}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl font-medium tracking-tight text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Standard Cancel / Submit row used inside forms. */
export function FormActions({
  onClose,
  editing,
  submitLabel,
}: {
  onClose: () => void;
  editing: boolean;
  submitLabel?: string;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-line/70 pt-5 sm:flex-row sm:justify-end">
      <Button variant="secondary" size="lg" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit" size="lg">
        {submitLabel ?? (editing ? "Save changes" : "Add")}
      </Button>
    </div>
  );
}

/** Inline field-level error message. */
export function FieldError({ message }: { message: string }) {
  return (
    <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm text-ember">
      <CircleAlert className="size-4 shrink-0" />
      {message}
    </p>
  );
}
