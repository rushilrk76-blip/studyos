"use client";

import { createContext, useContext } from "react";
import type { StudentProfile } from "@/lib/student";

/*
  Makes the saved student profile available to every app page
  without each one re-reading localStorage.

  The AppShell (the only place that touches storage) provides
  the value; pages consume it with useStudent().

  updateProfile() lets the Profile/Settings pages change the
  name or photo in one place — the change propagates to every
  page that reads from this context (Dashboard greeting,
  Portfolio, sidebar, etc.).
*/
export type StudentState =
  | { status: "loading" }
  | {
      status: "ready";
      profile: StudentProfile;
      /** Saves an updated profile to storage AND updates context state. */
      updateProfile: (profile: StudentProfile) => void;
    };

export const StudentContext = createContext<StudentState>({
  status: "loading",
});

export function useStudent(): StudentState {
  return useContext(StudentContext);
}
