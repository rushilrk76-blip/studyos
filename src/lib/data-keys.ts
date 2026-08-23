/*
  ────────────────────────────────────────────────
  Every StudyOS localStorage key, in one place.

  Used by:
  - Data export   (reads them all)
  - Clear My Data (removes only these — never other apps' keys)
  ────────────────────────────────────────────────
*/

export const DATA_VERSION = 1;

export const STORAGE_KEYS = {
  profile: "studyos:student-profile:v1",
  draft: "studyos:onboarding-draft:v1",
  syllabusProgress: "studyos:syllabus-progress:v1",
  practiceProgress: "studyos:practice-progress:v1",
  sciencePractice: "studyos:science-practice:v1",
  tasks: "studyos:tasks:v1",
  results: "studyos:results:v1",
  projects: "studyos:projects:v1",
  certificates: "studyos:certificates:v1",
  theme: "studyos:theme:v1",
  notificationSettings: "studyos:notification-settings:v1",
  firedReminders: "studyos:fired-reminders:v1",
  recentSearches: "studyos:recent-searches:v1",
} as const;

/** Every StudyOS-owned key, for safe clearing. */
export const ALL_STUDYOS_KEYS = Object.values(STORAGE_KEYS);
