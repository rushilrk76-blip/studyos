import {
  createResultId,
  loadResults,
  saveResults,
  clearResults,
} from "@/lib/marks-storage";
import type { ExamResult, ResultDraft } from "@/lib/marks/types";

/*
  ────────────────────────────────────────────────
  Exam results service.

  Encapsulates all CRUD on the student's test results. Only
  raw marks (marksObtained, maximumMarks) are stored —
  percentage is always derived.

  Data integrity: update/delete operate on a single record by
  id, never overwriting unrelated results.

  FUTURE: methods become async when backed by Supabase
  (an `exam_results` table).
  ────────────────────────────────────────────────
*/

export const examService = {
  /** Generates a stable unique id for a new exam result. */
  createId(): string {
    return createResultId();
  },

  getResults(): ExamResult[] {
    return loadResults();
  },

  addResult(draft: ResultDraft): ExamResult[] {
    const results = loadResults();
    const result: ExamResult = {
      id: createResultId(),
      examName: draft.examName,
      examType: draft.examType,
      subject: draft.subject,
      marksObtained: Number(draft.marksObtained),
      maximumMarks: Number(draft.maximumMarks),
      examDate: draft.examDate,
      notes: draft.notes,
      createdAt: new Date().toISOString(),
    };
    const updated = [result, ...results];
    saveResults(updated);
    return updated;
  },

  /** Updates a single result by id, preserving the id/createdAt. */
  updateResult(id: string, draft: ResultDraft): ExamResult[] {
    const results = loadResults().map((result) =>
      result.id === id
        ? {
            ...result,
            examName: draft.examName,
            examType: draft.examType,
            subject: draft.subject,
            marksObtained: Number(draft.marksObtained),
            maximumMarks: Number(draft.maximumMarks),
            examDate: draft.examDate,
            notes: draft.notes,
          }
        : result,
    );
    saveResults(results);
    return results;
  },

  /** Deletes a single result by id. */
  deleteResult(id: string): ExamResult[] {
    const results = loadResults().filter((result) => result.id !== id);
    saveResults(results);
    return results;
  },

  /** Persists an arbitrary results array. */
  saveResults(results: ExamResult[]): void {
    saveResults(results);
  },

  clearResults(): void {
    clearResults();
  },
};
