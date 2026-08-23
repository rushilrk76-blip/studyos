/*
  ────────────────────────────────────────────────
  StudyOS Service Layer — single data-access point.

  ARCHITECTURE:

    UI (Dashboard, Portfolio, Syllabus, …)
      ↓  imports from  @/services
    Service Layer (this barrel)
      ↓  delegates to
    Storage Implementation (@/lib/*-storage.ts → localStorage)
      ↓
    FUTURE:  Supabase  (replace storage impl, services stay the same)

  Every component/page MUST import data access from here — never
  from @/lib/*-storage directly. This is the one switch that a
  future Supabase migration flips.

  ⚠️ localStorage is suitable for local-first / prototype usage
  but must NOT be treated as secure cloud storage. No passwords,
  tokens, or secrets are stored here.
  ────────────────────────────────────────────────
*/

export { studentService } from "@/services/student-service";
export { syllabusService } from "@/services/syllabus-service";
export { practiceService } from "@/services/practice-service";
export { taskService } from "@/services/task-service";
export { examService } from "@/services/exam-service";
export { portfolioService } from "@/services/portfolio-service";
export { dataService } from "@/services/data-service";
export {
  reminderService,
  type NotificationSettings,
  type NotificationPermissionState,
} from "@/services/reminder-service";
export {
  authService,
  type AuthState,
  type AuthMode,
  type AccountStatus,
  type LoginResult,
} from "@/services/auth-service";
export {
  backupService,
  type StudyOSBackup,
  type RestoreSummary,
  type ValidationResult,
} from "@/services/backup-service";
