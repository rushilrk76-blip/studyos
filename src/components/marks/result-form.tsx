"use client";

import { useEffect, useRef, useState } from "react";
import { CircleAlert} from "lucide-react";
import {
  EXAM_TYPES,
  type ExamResult,
  type ExamType,
  type ResultDraft,
} from "@/lib/marks/types";
import { calcPercentage } from "@/lib/marks/results";
import { todayKey } from "@/lib/homework/tasks";
import { Button } from "@/components/ui/button";
import { ModalShell } from "@/components/ui/modal";

/*
  Add / Edit result form (modal sheet). Percentage is computed
  live from the two marks inputs — never typed by the student.
  Editing keeps the existing record's id; only fields here change.
*/

const inputBase =
  "mt-1.5 w-full rounded-2xl border bg-surface px-4 text-[15px] text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-pine-600/25";

export function ResultForm({
  subjects,
  editing,
  onSubmit,
  onClose,
}: {
  subjects: string[];
  editing: ExamResult | null;
  onSubmit: (draft: ResultDraft) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<ResultDraft>({
    examName: editing?.examName ?? "",
    examType: editing?.examType ?? "Unit Test",
    subject: editing?.subject ?? subjects[0] ?? "Other",
    marksObtained:
      editing != null ? String(editing.marksObtained) : "",
    maximumMarks:
      editing != null ? String(editing.maximumMarks) : "",
    examDate: editing?.examDate ?? todayKey(),
    notes: editing?.notes ?? "",
  });
  const [showErrors, setShowErrors] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const obtainedNum = Number(draft.marksObtained);
  const maxNum = Number(draft.maximumMarks);
  const livePercent =
    draft.maximumMarks && maxNum > 0
      ? calcPercentage(obtainedNum, maxNum)
      : null;

  const errors = {
    examName: draft.examName.trim() === "" ? "Please enter an exam/test name." : "",
    examType: "", // selected from a list, always set
    subject: draft.subject === "" ? "Please choose a subject." : "",
    examDate: draft.examDate === "" ? "Please pick an exam date." : "",
    marksObtained:
      draft.marksObtained === "" || Number.isNaN(obtainedNum)
        ? "Enter the marks obtained."
        : obtainedNum < 0
          ? "Marks can't be negative."
          : maxNum > 0 && obtainedNum > maxNum
            ? "Obtained can't exceed maximum marks."
            : "",
    maximumMarks:
      draft.maximumMarks === "" || Number.isNaN(maxNum)
        ? "Enter the maximum marks."
        : maxNum <= 0
          ? "Maximum marks must be greater than zero."
          : "",
  };
  const isValid = Object.values(errors).every((message) => message === "");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isValid) {
      setShowErrors(true);
      return;
    }
    onSubmit({
      ...draft,
      examName: draft.examName.trim(),
      notes: draft.notes.trim(),
      marksObtained: draft.marksObtained,
      maximumMarks: draft.maximumMarks,
    });
  }

  return (
    <ModalShell
      title={editing ? "Edit result" : "Add a result"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          {/* Exam name */}
          <div>
            <label htmlFor="exam-name" className="text-sm font-semibold text-ink">
              Exam / Test name <span className="text-ember">*</span>
            </label>
            <input
              id="exam-name"
              ref={nameRef}
              type="text"
              value={draft.examName}
              maxLength={80}
              onChange={(e) => setDraft({ ...draft, examName: e.target.value })}
              placeholder="e.g., Unit Test 1"
              aria-invalid={showErrors && !!errors.examName}
              className={`${inputBase} h-12 ${
                showErrors && errors.examName
                  ? "border-ember"
                  : "border-line focus:border-pine-600"
              }`}
            />
            <FieldError show={showErrors} message={errors.examName} />
          </div>

          {/* Exam type + Subject */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="exam-type" className="text-sm font-semibold text-ink">
                Exam type <span className="text-ember">*</span>
              </label>
              <select
                id="exam-type"
                value={draft.examType}
                onChange={(e) =>
                  setDraft({ ...draft, examType: e.target.value as ExamType })
                }
                className={`${inputBase} h-12 border-line focus:border-pine-600`}
              >
                {EXAM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="result-subject" className="text-sm font-semibold text-ink">
                Subject <span className="text-ember">*</span>
              </label>
              <select
                id="result-subject"
                value={draft.subject}
                onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                className={`${inputBase} h-12 border-line focus:border-pine-600`}
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Marks */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="marks-obtained" className="text-sm font-semibold text-ink">
                Marks obtained <span className="text-ember">*</span>
              </label>
              <input
                id="marks-obtained"
                type="number"
                inputMode="decimal"
                min="0"
                value={draft.marksObtained}
                onChange={(e) =>
                  setDraft({ ...draft, marksObtained: e.target.value })
                }
                placeholder="e.g., 42"
                aria-invalid={showErrors && !!errors.marksObtained}
                className={`${inputBase} h-12 ${
                  showErrors && errors.marksObtained
                    ? "border-ember"
                    : "border-line focus:border-pine-600"
                }`}
              />
              <FieldError show={showErrors} message={errors.marksObtained} />
            </div>

            <div>
              <label htmlFor="maximum-marks" className="text-sm font-semibold text-ink">
                Maximum marks <span className="text-ember">*</span>
              </label>
              <input
                id="maximum-marks"
                type="number"
                inputMode="decimal"
                min="1"
                value={draft.maximumMarks}
                onChange={(e) =>
                  setDraft({ ...draft, maximumMarks: e.target.value })
                }
                placeholder="e.g., 50"
                aria-invalid={showErrors && !!errors.maximumMarks}
                className={`${inputBase} h-12 ${
                  showErrors && errors.maximumMarks
                    ? "border-ember"
                    : "border-line focus:border-pine-600"
                }`}
              />
              <FieldError show={showErrors} message={errors.maximumMarks} />
            </div>
          </div>

          {/* Live percentage — calculated, not entered */}
          {livePercent !== null && (
            <div className="flex items-center justify-between rounded-2xl border border-pine-200 bg-pine-50 px-4 py-3">
              <span className="text-sm font-medium text-ink-soft">
                Calculated percentage
              </span>
              <span className="font-display text-2xl font-medium text-pine-700">
                {livePercent}%
              </span>
            </div>
          )}

          {/* Exam date */}
          <div>
            <label htmlFor="exam-date" className="text-sm font-semibold text-ink">
              Exam date <span className="text-ember">*</span>
            </label>
            <input
              id="exam-date"
              type="date"
              value={draft.examDate}
              onChange={(e) => setDraft({ ...draft, examDate: e.target.value })}
              aria-invalid={showErrors && !!errors.examDate}
              className={`${inputBase} h-12 ${
                showErrors && errors.examDate
                  ? "border-ember"
                  : "border-line focus:border-pine-600"
              }`}
            />
            <FieldError show={showErrors} message={errors.examDate} />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="result-notes" className="text-sm font-semibold text-ink">
              Notes <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <textarea
              id="result-notes"
              rows={3}
              maxLength={500}
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              placeholder="Anything worth remembering about this test…"
              className={`${inputBase} resize-none border-line py-3 focus:border-pine-600`}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-2 border-t border-line/70 pt-5 sm:flex-row sm:justify-end">
            <Button variant="secondary" size="lg" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="lg">
              {editing ? "Save changes" : "Save Result"}
            </Button>
          </div>
        </form>
    </ModalShell>
  );
}

function FieldError({ show, message }: { show: boolean; message: string }) {
  if (!show || !message) return null;
  return (
    <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm text-ember">
      <CircleAlert className="size-4 shrink-0" />
      {message}
    </p>
  );
}
