import { STORAGE_KEYS, DATA_VERSION, ALL_STUDYOS_KEYS } from "@/lib/data-keys";

/*
  ────────────────────────────────────────────────
  Data export — packages the student's locally-stored
  data into a single readable JSON file for download.

  Only USER data is exported. The static syllabus dataset
  (src/data/syllabus) is application code and is never
  included — it's not in localStorage.
  ────────────────────────────────────────────────
*/

export type ExportedData = {
  meta: {
    app: "StudyOS";
    version: string;
    dataVersion: typeof DATA_VERSION;
    exportedAt: string;
  };
  data: Record<string, unknown>;
};

const APP_VERSION = "1.0.0";

/** Collects all StudyOS user data from localStorage into one object. */
function collectUserData(): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  if (typeof window === "undefined") return data;

  for (const key of ALL_STUDYOS_KEYS) {
    if (key === STORAGE_KEYS.theme) continue; // preference, not user content
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) data[key] = JSON.parse(raw);
    } catch {
      data[key] = null;
    }
  }
  return data;
}

/** Builds the export payload. */
export function buildExportPayload(): ExportedData {
  return {
    meta: {
      app: "StudyOS",
      version: APP_VERSION,
      dataVersion: DATA_VERSION,
      exportedAt: new Date().toISOString(),
    },
    data: collectUserData(),
  };
}

/** Triggers a JSON file download of the student's data. */
export function downloadExport() {
  if (typeof window === "undefined") return;
  const payload = buildExportPayload();
  const json = JSON.stringify(payload, null, 2);
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
