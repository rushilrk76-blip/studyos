import Link from "next/link";
import { ArrowRight, Lightbulb } from "lucide-react";
import type { StudySuggestion } from "@/lib/dashboard";
import { SectionTitle } from "@/components/dashboard/section-title";

/*
  "What Should I Study Next?" — actionable suggestions derived
  from the student's actual syllabus and practice progress.
  Each suggestion links directly to the relevant page.
*/
export function StudyNext({ suggestions }: { suggestions: StudySuggestion[] }) {
  return (
    <section aria-labelledby="study-next-heading">
      <div className="flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-lg bg-pine-50 text-pine-600">
          <Lightbulb className="size-4" />
        </span>
        <SectionTitle id="study-next-heading" title="What Should I Study Next?" />
      </div>

      {suggestions.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-line bg-surface px-6 py-8 text-center">
          <p className="text-sm text-ink-muted">
            You&apos;ve started every chapter — keep going!
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {suggestions.map((s, i) => (
            <Link
              key={i}
              href={s.href}
              className="group flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-pine-200 hover:shadow-[0_16px_35px_-28px_rgba(23,113,83,0.4)]"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">
                  {s.subjectName}
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-ink">
                  {s.chapterTitle}
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">{s.hint}</p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-pine-600" />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
