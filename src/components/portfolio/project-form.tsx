"use client";

import { useEffect, useRef, useState } from "react";
import { markSubjectsForStream } from "@/lib/marks/types";
import type { Project, ProjectDraft } from "@/lib/portfolio/types";
import type { StreamId } from "@/lib/student";
import { todayKey } from "@/lib/homework/tasks";
import { ModalShell, FieldError, FormActions } from "@/components/ui/modal";

const inputBase =
  "mt-1.5 w-full rounded-2xl border bg-surface px-4 text-[15px] text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-pine-600/25";

export function ProjectForm({
  stream,
  editing,
  onSubmit,
  onClose,
}: {
  stream: StreamId;
  editing: Project | null;
  onSubmit: (draft: ProjectDraft) => void;
  onClose: () => void;
}) {
  const subjects = [...markSubjectsForStream(stream), "General"];
  const [draft, setDraft] = useState<ProjectDraft>({
    title: editing?.title ?? "",
    description: editing?.description ?? "",
    subject: editing?.subject ?? subjects[0] ?? "General",
    date: editing?.date ?? todayKey(),
    link: editing?.link ?? "",
  });
  const [showErrors, setShowErrors] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const titleError = draft.title.trim() === "" ? "Please enter a project title." : "";
  const isValid = !titleError;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isValid) {
      setShowErrors(true);
      return;
    }
    onSubmit({
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      link: draft.link.trim(),
    });
  }

  return (
    <ModalShell title={editing ? "Edit project" : "Add a project"} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        <div>
          <label htmlFor="project-title" className="text-sm font-semibold text-ink">
            Project title <span className="text-ember">*</span>
          </label>
          <input
            id="project-title"
            ref={titleRef}
            type="text"
            maxLength={100}
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="e.g., Physics Model Project"
            aria-invalid={showErrors && !!titleError}
            className={`${inputBase} h-12 ${
              showErrors && titleError ? "border-ember" : "border-line focus:border-pine-600"
            }`}
          />
          {showErrors && titleError && <FieldError message={titleError} />}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="project-subject" className="text-sm font-semibold text-ink">
              Subject
            </label>
            <select
              id="project-subject"
              value={draft.subject}
              onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
              className={`${inputBase} h-12 border-line focus:border-pine-600`}
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="project-date" className="text-sm font-semibold text-ink">
              Date
            </label>
            <input
              id="project-date"
              type="date"
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              className={`${inputBase} h-12 border-line focus:border-pine-600`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="project-desc" className="text-sm font-semibold text-ink">
            Description
          </label>
          <textarea
            id="project-desc"
            rows={3}
            maxLength={500}
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            placeholder="What was the project about?"
            className={`${inputBase} resize-none border-line py-3 focus:border-pine-600`}
          />
        </div>

        <div>
          <label htmlFor="project-link" className="text-sm font-semibold text-ink">
            Link <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <input
            id="project-link"
            type="url"
            value={draft.link}
            onChange={(e) => setDraft({ ...draft, link: e.target.value })}
            placeholder="https://…"
            className={`${inputBase} h-12 border-line focus:border-pine-600`}
          />
        </div>

        <FormActions onClose={onClose} editing={!!editing} />
      </form>
    </ModalShell>
  );
}

/* The form's modal primitives come from the shared ui module. */
export { ModalShell, FieldError, FormActions } from "@/components/ui/modal";
