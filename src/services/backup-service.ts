import { ALL_STUDYOS_KEYS, STORAGE_KEYS } from "@/lib/data-keys";
import type { StudentProfile } from "@/lib/student";
import { isBoardId, isStreamId } from "@/lib/student";
import type { Task } from "@/lib/homework/types";
import type { ExamResult } from "@/lib/marks/types";
import type { Project, Certificate } from "@/lib/portfolio/types";
import type { TopicProgress } from "@/lib/syllabus/types";
import type { QuestionProgress } from "@/lib/practice/types";
import type { ConceptProgress } from "@/lib/practice/concept-types";

/* storage save functions for restore */
import { saveProfile } from "@/lib/student-storage";
import { saveTopicProgress } from "@/lib/syllabus-storage";
import { saveQuestionProgress } from "@/lib/practice-storage";
import { saveSciencePractice } from "@/lib/science-practice-storage";
import { saveTasks } from "@/lib/homework-storage";
import { saveResults } from "@/lib/marks-storage";
import { saveProjects, saveCertificates } from "@/lib/portfolio-storage";

/* static data for ID validation during restore */
import { getSyllabus } from "@/data/syllabus";
import { getMathsPractice } from "@/data/practice";
import { getSciencePractice } from "@/data/practice/science";

/*
  ────────────────────────────────────────────────
  Backup & Restore service.

  BACKUP: collects all user data into a structured JSON.
  RESTORE: validates, matches IDs against the current app's
  syllabus/practice datasets, and writes atomically with
  a rollback if anything fails.

  The backup contains ONLY user data — never the static
  syllabus or question definitions. Those are application
  code and come from whatever device runs StudyOS.

  ⚠️ Backups are NOT encrypted. Don't include secrets.
  ────────────────────────────────────────────────
*/

export const BACKUP_VERSION = 1;

/* ── Backup type ─────────────────────────────── */
export type StudyOSBackup = {
  app: "StudyOS";
  backupVersion: number;
  createdAt: string;
  student: StudentProfile | null;
  settings: { theme?: string };
  syllabusProgress: TopicProgress;
  practiceProgress: QuestionProgress;
  sciencePractice: ConceptProgress;
  tasks: Task[];
  examResults: ExamResult[];
  projects: Project[];
  certificates: Certificate[];
};

/* ── Validation result ──────────────────────── */
export type ValidationResult =
  | { valid: true; backup: StudyOSBackup }
  | { valid: false; error: string };

/* ── Restore result ─────────────────────────── */
export type RestoreSummary = {
  success: boolean;
  student: StudentProfile | null;
  syllabusTopics: number;
  practiceQuestions: number;
  homeworkTasks: number;
  examResults: number;
  projects: number;
  certificates: number;
  skippedRecords: number;
  error?: string;
};

/* ── Build a backup from current localStorage ── */
export function createBackup(): StudyOSBackup {
  const read = (key: string): unknown => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  return {
    app: "StudyOS",
    backupVersion: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    student: read(STORAGE_KEYS.profile) as StudentProfile | null,
    settings: {
      theme:
        (read(STORAGE_KEYS.theme) as string | null) ?? undefined,
    },
    syllabusProgress:
      (read(STORAGE_KEYS.syllabusProgress) as TopicProgress) ?? {},
    practiceProgress:
      (read(STORAGE_KEYS.practiceProgress) as QuestionProgress) ?? {},
    sciencePractice:
      (read(STORAGE_KEYS.sciencePractice) as ConceptProgress) ?? {},
    tasks: (read(STORAGE_KEYS.tasks) as Task[]) ?? [],
    examResults: (read(STORAGE_KEYS.results) as ExamResult[]) ?? [],
    projects: (read(STORAGE_KEYS.projects) as Project[]) ?? [],
    certificates: (read(STORAGE_KEYS.certificates) as Certificate[]) ?? [],
  };
}

/* ── Trigger file download ──────────────────── */
export function downloadBackup(): void {
  if (typeof window === "undefined") return;
  const backup = createBackup();
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = url;
  a.download = `studyos-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ── Read a file and parse to JSON ──────────── */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/* ── Validate a parsed backup ───────────────── */
export function validateBackup(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== "object") {
    return { valid: false, error: "This file is not a valid StudyOS backup." };
  }

  const obj = raw as Record<string, unknown>;

  if (obj.app !== "StudyOS") {
    return {
      valid: false,
      error: "This file does not belong to StudyOS.",
    };
  }

  if (typeof obj.backupVersion !== "number") {
    return {
      valid: false,
      error: "This backup is missing a version number.",
    };
  }

  if (obj.backupVersion > BACKUP_VERSION) {
    return {
      valid: false,
      error: `This backup (v${obj.backupVersion}) is newer than this StudyOS version supports (v${BACKUP_VERSION}).`,
    };
  }

  /* Type-check each field with safe defaults. */
  const isRecord = (v: unknown): v is Record<string, unknown> =>
    !!v && typeof v === "object";

  const backup: StudyOSBackup = {
    app: "StudyOS",
    backupVersion: obj.backupVersion as number,
    createdAt: typeof obj.createdAt === "string" ? obj.createdAt : "",
    student: isRecord(obj.student) ? (obj.student as StudentProfile) : null,
    settings: isRecord(obj.settings) ? (obj.settings as { theme?: string }) : {},
    syllabusProgress: isRecord(obj.syllabusProgress)
      ? filterProgress(obj.syllabusProgress)
      : {},
    practiceProgress: isRecord(obj.practiceProgress)
      ? filterProgress(obj.practiceProgress)
      : {},
    sciencePractice: isRecord(obj.sciencePractice)
      ? filterProgress(obj.sciencePractice)
      : {},
    tasks: Array.isArray(obj.tasks) ? (obj.tasks as Task[]) : [],
    examResults: Array.isArray(obj.examResults) ? (obj.examResults as ExamResult[]) : [],
    projects: Array.isArray(obj.projects) ? (obj.projects as Project[]) : [],
    certificates: Array.isArray(obj.certificates) ? (obj.certificates as Certificate[]) : [],
  };

  return { valid: true, backup };
}

function filterProgress(
  raw: Record<string, unknown>,
): Record<string, "completed"> {
  const clean: Record<string, "completed"> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value === "completed") clean[key] = "completed";
  }
  return clean;
}

/* ── Restore: write backup data to localStorage ── */
export function restoreBackup(backup: StudyOSBackup): RestoreSummary {
  if (typeof window === "undefined") {
    return {
      success: false,
      student: null,
      syllabusTopics: 0,
      practiceQuestions: 0,
      homeworkTasks: 0,
      examResults: 0,
      projects: 0,
      certificates: 0,
      skippedRecords: 0,
      error: "Cannot restore outside a browser.",
    };
  }

  /* 1. Snapshot current data for rollback. */
  const snapshot = new Map<string, string | null>();
  for (const key of ALL_STUDYOS_KEYS) {
    snapshot.set(key, window.localStorage.getItem(key));
  }

  /* 2. Attempt to write all data. */
  try {
    let skipped = 0;

    /* Student profile — validate board/stream. */
    if (backup.student) {
      const s = backup.student;
      if (
        isBoardId(s.board) &&
        isStreamId(s.stream) &&
        typeof s.name === "string" &&
        s.name.trim().length > 0
      ) {
        saveProfile(s);
      } else {
        throw new Error("Invalid student profile in backup.");
      }
    }

    /* Syllabus progress — match against current syllabus dataset. */
    if (backup.student) {
      const validIds = collectValidTopicIds(
        backup.student.board,
        backup.student.stream,
      );
      const filtered: TopicProgress = {};
      for (const [id, value] of Object.entries(backup.syllabusProgress)) {
        if (validIds.has(id)) filtered[id] = value;
        else skipped++;
      }
      saveTopicProgress(filtered);
    }

    /* Maths practice — match IDs. */
    if (backup.student) {
      const validQIds = collectValidMathsQuestionIds(backup.student.board);
      const filtered: QuestionProgress = {};
      for (const [id, value] of Object.entries(backup.practiceProgress)) {
        if (validQIds.has(id)) filtered[id] = value;
        else skipped++;
      }
      saveQuestionProgress(filtered);

      /* Science practice — match IDs. */
      const validSIds = collectValidScienceQuestionIds(backup.student.board);
      const filteredS: ConceptProgress = {};
      for (const [id, value] of Object.entries(backup.sciencePractice)) {
        if (validSIds.has(id)) filteredS[id] = value;
        else skipped++;
      }
      saveSciencePractice(filteredS);
    }

    /* Tasks, results, projects, certificates — write directly. */
    saveTasks(backup.tasks);
    saveResults(backup.examResults);
    saveProjects(backup.projects);
    saveCertificates(backup.certificates);

    /* Settings — only theme, preserve current if not in backup. */
    if (backup.settings.theme) {
      window.localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(backup.settings.theme));
    }

    return {
      success: true,
      student: backup.student,
      syllabusTopics: backup.student
        ? Object.keys(
            filterByValid(
              backup.syllabusProgress,
              collectValidTopicIds(backup.student.board, backup.student.stream),
            ),
          ).length
        : 0,
      practiceQuestions: backup.student
        ? Object.keys(
            filterByValid(
              backup.practiceProgress,
              collectValidMathsQuestionIds(backup.student.board),
            ),
          ).length +
          Object.keys(
            filterByValid(
              backup.sciencePractice,
              collectValidScienceQuestionIds(backup.student.board),
            ),
          ).length
        : 0,
      homeworkTasks: backup.tasks.length,
      examResults: backup.examResults.length,
      projects: backup.projects.length,
      certificates: backup.certificates.length,
      skippedRecords: skipped,
    };
  } catch (error) {
    /* 3. Rollback on failure — restore exact snapshot. */
    for (const [key, value] of snapshot) {
      if (value === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
    }
    return {
      success: false,
      student: null,
      syllabusTopics: 0,
      practiceQuestions: 0,
      homeworkTasks: 0,
      examResults: 0,
      projects: 0,
      certificates: 0,
      skippedRecords: 0,
      error: error instanceof Error ? error.message : "Restore failed.",
    };
  }
}

/* ── ID collectors ───────────────────────────── */
function collectValidTopicIds(board: string, stream: string): Set<string> {
  const ids = new Set<string>();
  try {
    const syllabus = getSyllabus(
      board as Parameters<typeof getSyllabus>[0],
      stream as Parameters<typeof getSyllabus>[1],
    );
    for (const subject of syllabus.subjects) {
      for (const chapter of subject.chapters) {
        for (const topic of chapter.topics) {
          ids.add(topic.id);
        }
      }
    }
  } catch {
    /* board/stream mismatch — return empty set so all IDs are skipped */
  }
  return ids;
}

function collectValidMathsQuestionIds(board: string): Set<string> {
  const ids = new Set<string>();
  try {
    const practice = getMathsPractice(
      board as Parameters<typeof getMathsPractice>[0],
    );
    for (const chapter of practice.chapters) {
      for (const set of chapter.sets) {
        for (const q of set.questions) ids.add(q.id);
      }
    }
  } catch {
    /* stream without maths — return empty */
  }
  return ids;
}

function collectValidScienceQuestionIds(board: string): Set<string> {
  const ids = new Set<string>();
  for (const subject of ["physics", "chemistry"] as const) {
    try {
      const practice = getSciencePractice(
        board as Parameters<typeof getSciencePractice>[0],
        subject,
      );
      for (const chapter of practice.chapters) {
        for (const cat of chapter.categories) {
          for (const q of cat.questions) ids.add(q.id);
        }
      }
    } catch {
      /* ignore */
    }
  }
  return ids;
}

function filterByValid(
  progress: Record<string, "completed">,
  validIds: Set<string>,
): Record<string, "completed"> {
  const filtered: Record<string, "completed"> = {};
  for (const [id, value] of Object.entries(progress)) {
    if (validIds.has(id)) filtered[id] = value;
  }
  return filtered;
}

/* ── Service object (matches the pattern of other services) ── */
export const backupService = {
  createBackup,
  downloadBackup,
  readFileAsText,
  validateBackup,
  restoreBackup,
  getBackupVersion: () => BACKUP_VERSION,
};
