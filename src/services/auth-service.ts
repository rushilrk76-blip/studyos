import { supabase, isSupabaseConfigured } from "@/lib/supabase-client";
import type { StudentProfile } from "@/lib/student";

/*
  ────────────────────────────────────────────────
  Authentication Service

  Handles Student ID + Password login through Supabase
  Auth, access-status verification, and session/device
  management.

  STUDENT ID → EMAIL MAPPING:
  Supabase Auth requires an email internally. We map
  Student IDs to synthetic emails:
    STU001 → stu001@studyos.local
  The student never sees or types this email.

  ACCESS FLOW:
    1. Sign in with Student ID + password (via Supabase Auth)
    2. Fetch profile → check status (active/blocked/expired/pending)
    3. Check date range (access_start_date / access_expiry_date)
    4. Register/update device session
    5. Grant or deny access

  LOCAL FALLBACK:
  When Supabase is not configured, all functions return
  null/false gracefully. The existing LocalStorage flow
  is the default — this service never crashes without
  credentials.

  SECURITY:
  - Passwords are NEVER stored in our tables — Supabase
    Auth handles hashing (bcrypt) server-side.
  - No service-role key in frontend code.
  - Access decisions call a PostgreSQL function
    (check_student_access) that runs server-side.
  ────────────────────────────────────────────────
*/

/** Synthetic domain for Student ID → email mapping. */
const SYNTHETIC_DOMAIN = "studyos.com";

/** Converts a Student ID to a Supabase Auth email. */
export function studentIdToEmail(studentId: string): string {
  return `${studentId.toLowerCase()}@${SYNTHETIC_DOMAIN}`;
}

export type AccountStatus = "active" | "blocked" | "expired" | "pending" | "unknown";

export type AuthMode = "local" | "cloud";

export type AuthState = {
  mode: AuthMode;
  isAuthenticated: boolean;
  userId: string | null;
  profile: StudentProfile | null;
  accountStatus: AccountStatus;
  hasAccess: boolean;
};

export type LoginResult =
  | { success: true; profile: StudentProfile }
  | { success: false; error: string };

export const authService = {
  /** Returns 'local' when Supabase isn't configured, 'cloud' otherwise. */
  getMode(): AuthMode {
    return isSupabaseConfigured ? "cloud" : "local";
  },

  /**
   * Signs in a student using their Student ID + password.
   * Maps the ID to a synthetic email for Supabase Auth.
   * Does NOT store or check passwords in our tables.
   */
  async signInWithStudentId(
    studentId: string,
    password: string,
  ): Promise<LoginResult> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error: "StudyOS Cloud is not configured. Running in local mode.",
      };
    }

    const email = studentIdToEmail(studentId.trim());
    
    console.log("LOGIN EMAIL:", email);

    // Step 1: Authenticate via Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (authError || !authData.user) {
      // Generic error — don't reveal whether the ID exists
      return {
        success: false,
        error: "Invalid Student ID or password.",
      };
    }

    // Step 2: Fetch the student's profile
    const { data: profileRow, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", authData.user.id)
      .single();

    if (profileError || !profileRow) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: "Account not found. Please contact your administrator.",
      };
    }

    // Step 3: Check access via server-side function
    const { data: accessResult } = await supabase.rpc("check_student_access", {
      p_user_id: authData.user.id,
    });

    if (accessResult && !accessResult.has_access) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: accessResult.reason || "Access denied.",
      };
    }

    // Step 4: Build the StudentProfile from the DB row
    const profile: StudentProfile = {
      name: profileRow.name,
      board: profileRow.board,
      stream: profileRow.stream,
      photoDataUrl: profileRow.photo_url ?? null,
      createdAt: profileRow.created_at,
      studentId: profileRow.student_id,
    };

    return { success: true, profile };
  },

  /** Signs out and invalidates the session. */
  async signOut(): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.auth.signOut();
  },

  /**
   * Gets the current auth state. Returns null in local mode.
   * In cloud mode, checks whether a valid session exists
   * and the account still has access.
   */
  async getCurrentAuth(): Promise<AuthState> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        mode: "local",
        isAuthenticated: false,
        userId: null,
        profile: null,
        accountStatus: "unknown",
        hasAccess: false,
      };
    }

    const { data: sessionData } = await supabase.auth.getUser();

    if (!sessionData.user) {
      return {
        mode: "cloud",
        isAuthenticated: false,
        userId: null,
        profile: null,
        accountStatus: "unknown",
        hasAccess: false,
      };
    }

    // Fetch profile
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", sessionData.user.id)
      .single();

    if (!profileRow) {
      return {
        mode: "cloud",
        isAuthenticated: true,
        userId: sessionData.user.id,
        profile: null,
        accountStatus: "unknown",
        hasAccess: false,
      };
    }

    // Check access
    const { data: accessResult } = await supabase.rpc("check_student_access", {
      p_user_id: sessionData.user.id,
    });

    const hasAccess = accessResult?.has_access ?? false;
    const status = (accessResult?.status ?? "unknown") as AccountStatus;

    const profile: StudentProfile = {
      name: profileRow.name,
      board: profileRow.board,
      stream: profileRow.stream,
      photoDataUrl: profileRow.photo_url ?? null,
      createdAt: profileRow.created_at,
      studentId: profileRow.student_id,
    };

    return {
      mode: "cloud",
      isAuthenticated: true,
      userId: sessionData.user.id,
      profile,
      accountStatus: status,
      hasAccess,
    };
  },

  /**
   * Registers or updates a device session for the current user.
   * Called after successful login. The device limit is enforced
   * by a follow-up check (see enforceDeviceLimit).
   */
  async registerDevice(userAgent: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return false;

    const { error } = await supabase.from("device_sessions").insert({
      user_id: userData.user.id,
      user_agent: userAgent.slice(0, 500),
    });

    return !error;
  },

  /**
   * Checks how many active device sessions a user has.
   * Returns count + whether a new device is allowed.
   */
  async checkDeviceLimit(maxDevices = 2): Promise<{
    activeCount: number;
    canAddDevice: boolean;
  }> {
    if (!isSupabaseConfigured || !supabase) {
      return { activeCount: 0, canAddDevice: true };
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { activeCount: 0, canAddDevice: true };

    const { count } = await supabase
      .from("device_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userData.user.id)
      .eq("is_active", true);

    const activeCount = count ?? 0;
    return { activeCount, canAddDevice: activeCount < maxDevices };
  },
};
