import {
  draftFromProfile,
  generateStudentId,
  type OnboardingDraft,
  type StudentProfile,
} from "@/lib/student";
import {
  clearDraft,
  clearProfile,
  loadDraft,
  loadProfile,
  saveDraft,
  saveProfile,
} from "@/lib/student-storage";

/*
  ────────────────────────────────────────────────
  Student profile service.

  The ONE source of truth for student identity. Dashboard,
  Portfolio, Profile, Settings and the sidebar all read from
  here — there is no duplicate copy of name/board/stream/ID.

  FUTURE: methods will become async when backed by Supabase
  (e.g. await studentService.getProfile()). Method signatures
  and return types won't change.
  ────────────────────────────────────────────────
*/

export const studentService = {
  /** Returns the saved profile, or null if onboarding isn't done. */
  getProfile(): StudentProfile | null {
    return loadProfile();
  },

  /** Persists an updated profile (name, photo, etc.). */
  saveProfile(profile: StudentProfile): void {
    saveProfile(profile);
  },

  /** Onboarding draft — survives a refresh mid-setup. */
  getDraft(): OnboardingDraft | null {
    return loadDraft();
  },

  /** Prefills the draft from an existing profile (for re-editing). */
  getDraftFromProfile(profile: StudentProfile): OnboardingDraft {
    return draftFromProfile(profile);
  },

  saveDraft(draft: OnboardingDraft): void {
    saveDraft(draft);
  },

  clearDraft(): void {
    clearDraft();
  },

  /**
   * Ensures the profile has a stable student ID. Generates and
   * persists one if missing (backfill for older profiles).
   */
  ensureStudentId(profile: StudentProfile): StudentProfile {
    if (profile.studentId) return profile;
    const updated = {
      ...profile,
      studentId: generateStudentId(profile.board, profile.stream),
    };
    saveProfile(updated);
    return updated;
  },

  /** Removes the saved profile (used by Clear My Data). */
  clearProfile(): void {
    clearProfile();
  },
};
