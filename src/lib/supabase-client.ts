import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/*
  ────────────────────────────────────────────────
  Supabase browser-safe client.

  Reads NEXT_PUBLIC_ env vars (safe to expose to the browser).
  NEVER import or use the service-role key in frontend code.

  When env vars are absent (local-first mode), the client is
  null and the cloud data service falls back gracefully.
  Existing LocalStorage continues working — this module
  doesn't replace it until authentication is wired in.
  ────────────────────────────────────────────────
*/

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True only when both required env vars are configured. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * The singleton Supabase client — null when not configured.
 * Check isSupabaseConfigured before using.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;
