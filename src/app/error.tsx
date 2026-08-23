"use client";

import { useEffect } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";

/*
  Root error boundary — catches render/runtime errors anywhere
  in the app so a single page failure never takes the whole
  interface down. This is Next.js's framework-native boundary;
  it must be a client component.
*/
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log silently for debugging; users see the friendly fallback below.
    console.error("StudyOS encountered an error:", error);
  }, [error]);

  return (
    <div className="dot-grid grid min-h-screen place-items-center bg-canvas px-6">
      <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-8 text-center shadow-2xl">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-ember/10 text-ember">
          <TriangleAlert className="size-7" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-medium tracking-tight text-ink">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          StudyOS hit an unexpected problem. Your data is safe — try reloading
          the page.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-pine-600 px-5 text-sm font-medium text-white transition-colors hover:bg-pine-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-600"
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 text-sm font-medium text-ink transition-colors hover:border-ink/25 hover:bg-canvas"
          >
            Reload page
          </button>
        </div>
      </div>
    </div>
  );
}
