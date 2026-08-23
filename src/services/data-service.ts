import { ALL_STUDYOS_KEYS, DATA_VERSION, STORAGE_KEYS } from "@/lib/data-keys";
import {
  buildExportPayload,
  downloadExport,
  type ExportedData,
} from "@/lib/data-export";
import { clearDraft, clearProfile } from "@/lib/student-storage";
import { clearTopicProgress } from "@/lib/syllabus-storage";
import { clearQuestionProgress } from "@/lib/practice-storage";
import { clearSciencePractice } from "@/lib/science-practice-storage";
import { clearTasks } from "@/lib/homework-storage";
import { clearResults } from "@/lib/marks-storage";
import { saveCertificates, saveProjects } from "@/lib/portfolio-storage";

/*
  ────────────────────────────────────────────────
  Data management service — export, clear, versioning.

  Handles app-wide data operations that span multiple
  systems: the JSON export and the "Clear My Data" reset.

  IMPORTANT: Clear only removes StudyOS-owned keys from
  localStorage — never other apps' keys. The static syllabus
  dataset is application code, not storage, so it is never
  affected by clearing.

  ⚠️ localStorage is NOT secure cloud storage. Do not store
  passwords, tokens, or secrets here.
  ────────────────────────────────────────────────
*/

export const dataService = {
  /** Builds the export payload (useful for testing / API). */
  buildExport(): ExportedData {
    return buildExportPayload();
  },

  /** Triggers a JSON file download of all user data. */
  downloadExport(): void {
    downloadExport();
  },

  /** The current data schema version, for future migrations. */
  getDataVersion(): number {
    return DATA_VERSION;
  },

  /**
   * Clears ALL StudyOS user data from this browser and returns
   * the app to onboarding. Only StudyOS-owned keys are removed.
   */
  clearAllUserData(): void {
    clearDraft();
    clearProfile();
    clearTopicProgress();
    clearQuestionProgress();
    clearSciencePractice();
    clearTasks();
    clearResults();
    saveProjects([]);
    saveCertificates([]);
  },

  /** The list of all StudyOS localStorage keys (for debugging). */
  getAllKeys(): readonly string[] {
    return ALL_STUDYOS_KEYS;
  },
};
