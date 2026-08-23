"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, GraduationCap, Loader2, Lock, LogIn } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase-client";
import { authService } from "@/services/auth-service";
import { studentService } from "@/services/student-service";
import { Logo } from "@/components/layout/logo";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

/*
  Login form for StudyOS Cloud mode.

  SECURITY:
  - When Supabase is NOT configured, shows a clear development
    message instead of a fake login form.
  - When Supabase IS configured, shows Student ID + Password.
  - Passwords go through Supabase Auth (bcrypt, server-side).
  - No passwords are stored in our database or localStorage.
  - Login errors are generic (don't reveal which field is wrong).

  Student ID → email mapping happens inside authService.
  The student never sees the synthetic email.
*/

const inputBase =
  "mt-1.5 w-full rounded-2xl border bg-surface px-4 text-[15px] text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-pine-600/25";

export function LoginForm() {
  const router = useRouter();
  const cloudReady = isSupabaseConfigured;
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId.trim() || !password) {
      setError("Please enter your Student ID and password.");
      return;
    }
    setLoading(true);
    setError(null);

    const result = await authService.signInWithStudentId(
      studentId.trim(),
      password,
    );

    setLoading(false);

    if (result.success) {
      studentService.saveProfile(result.profile);
      router.replace("/dashboard");
    } else {
      setError(result.error);
    }
  }

  // ── Development mode (Supabase not configured) ──
  if (!cloudReady) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-canvas">
        <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden />
        <header className="relative border-b border-line/60 bg-canvas/80 backdrop-blur-sm">
          <Container className="flex h-16 items-center justify-between">
            <Logo />
          </Container>
        </header>
        <main className="relative grid min-h-[calc(100vh-4rem)] place-items-center px-6">
          <div className="w-full max-w-md text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-pine-600 text-white shadow-lg">
              <GraduationCap className="size-8" />
            </span>
            <h1 className="mt-6 font-display text-2xl font-medium tracking-tight text-ink">
              Development Mode
            </h1>
            <p className="mx-auto mt-3 max-w-sm leading-relaxed text-ink-soft">
              StudyOS Cloud is not configured. The app is running in local mode
              — your data is stored in this browser only.
            </p>
            <p className="mt-4 text-xs text-ink-muted">
              To enable cloud accounts, set{" "}
              <code className="rounded bg-canvas px-1.5 py-0.5">
                NEXT_PUBLIC_SUPABASE_URL
              </code>{" "}
              and{" "}
              <code className="rounded bg-canvas px-1.5 py-0.5">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </code>{" "}
              in your environment. See{" "}
              <code className="rounded bg-canvas px-1.5 py-0.5">
                SUPABASE_SETUP.md
              </code>
              .
            </p>
            <Button href="/get-started" size="lg" className="mt-7">
              Continue in Local Mode
              <ArrowLeft className="size-4" />
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // ── Cloud mode (Supabase configured) ──
  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas">
      <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden />
      <header className="relative border-b border-line/60 bg-canvas/80 backdrop-blur-sm">
        <Container className="flex h-16 items-center justify-between">
          <Logo />
          <Button href="/" variant="ghost" size="md">
            <ArrowLeft className="size-4" />
            Home
          </Button>
        </Container>
      </header>

      <main className="relative grid min-h-[calc(100vh-4rem)] place-items-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="rounded-3xl border border-line bg-surface p-7 shadow-[0_24px_60px_-30px_rgba(16,24,40,0.2)]">
            <div className="text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-pine-600 text-white shadow-lg">
                <Lock className="size-7" />
              </span>
              <h1 className="mt-5 font-display text-2xl font-medium tracking-tight text-ink">
                Student Login
              </h1>
              <p className="mt-1.5 text-sm text-ink-soft">
                Enter your Student ID and password.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="student-id"
                  className="text-sm font-semibold text-ink"
                >
                  Student ID
                </label>
                <input
                  id="student-id"
                  type="text"
                  autoComplete="username"
                  value={studentId}
                  maxLength={20}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="STU001"
                  className={`${inputBase} h-12 border-line focus:border-pine-600`}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-ink"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputBase} h-12 border-line focus:border-pine-600`}
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-ember/25 bg-ember/5 px-4 py-2.5 text-sm text-ember"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <LogIn className="size-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </div>

          <p className="mt-4 text-center text-xs text-ink-muted">
            Don&apos;t have an account? Contact your administrator.
          </p>
        </div>
      </main>
    </div>
  );
}
