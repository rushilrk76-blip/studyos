"use client";

import { useEffect, useRef, useState } from "react";
import type { Certificate, CertificateDraft } from "@/lib/portfolio/types";
import { todayKey } from "@/lib/homework/tasks";
import { Button } from "@/components/ui/button";
import {
  FieldError,
  FormActions,
  ModalShell,
} from "@/components/portfolio/project-form";

const inputBase =
  "mt-1.5 w-full rounded-2xl border bg-surface px-4 text-[15px] text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-pine-600/25";

export function CertificateForm({
  editing,
  onSubmit,
  onClose,
}: {
  editing: Certificate | null;
  onSubmit: (draft: CertificateDraft) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<CertificateDraft>({
    title: editing?.title ?? "",
    organization: editing?.organization ?? "",
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

  const titleError = draft.title.trim() === "" ? "Please enter a certificate title." : "";
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
      organization: draft.organization.trim(),
      link: draft.link.trim(),
    });
  }

  return (
    <ModalShell
      title={editing ? "Edit certificate" : "Add a certificate"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        <div>
          <label htmlFor="cert-title" className="text-sm font-semibold text-ink">
            Certificate title <span className="text-ember">*</span>
          </label>
          <input
            id="cert-title"
            ref={titleRef}
            type="text"
            maxLength={100}
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="e.g., Science Exhibition Winner"
            aria-invalid={showErrors && !!titleError}
            className={`${inputBase} h-12 ${
              showErrors && titleError ? "border-ember" : "border-line focus:border-pine-600"
            }`}
          />
          {showErrors && titleError && <FieldError message={titleError} />}
        </div>

        <div>
          <label htmlFor="cert-org" className="text-sm font-semibold text-ink">
            Organization
          </label>
          <input
            id="cert-org"
            type="text"
            maxLength={100}
            value={draft.organization}
            onChange={(e) => setDraft({ ...draft, organization: e.target.value })}
            placeholder="e.g., School Science Club"
            className={`${inputBase} h-12 border-line focus:border-pine-600`}
          />
        </div>

        <div>
          <label htmlFor="cert-date" className="text-sm font-semibold text-ink">
            Date
          </label>
          <input
            id="cert-date"
            type="date"
            value={draft.date}
            onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            className={`${inputBase} h-12 border-line focus:border-pine-600`}
          />
        </div>

        <div>
          <label htmlFor="cert-link" className="text-sm font-semibold text-ink">
            Link / image reference <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <input
            id="cert-link"
            type="url"
            value={draft.link}
            onChange={(e) => setDraft({ ...draft, link: e.target.value })}
            placeholder="https://…"
            className={`${inputBase} h-12 border-line focus:border-pine-600`}
          />
        </div>

        <FormActions
          onClose={onClose}
          editing={!!editing}
          submitLabel={editing ? "Save changes" : "Add Certificate"}
        />
      </form>
    </ModalShell>
  );
}
