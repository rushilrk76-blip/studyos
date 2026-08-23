import Link from "next/link";
import type { SubjectEntry } from "@/lib/dashboard";
import { SectionTitle } from "@/components/dashboard/section-title";
import { ProgressBar } from "@/components/ui/progress-bar";

/*
  Subject cards showing BOTH syllabus % and practice % (where
  a practice system exists). Links to the syllabus page.
*/
export function SubjectProgressSection({ subjects }: { subjects: SubjectEntry[] }) {
  return (
    <section aria-labelledby="subjects-heading">
      <SectionTitle
        id="subjects-heading"
        title="Subject Progress"
        description="Syllabus and practice, side by side."
      />

      <div className={`mt-5 grid gap-4 ${subjects.length > 3 ? "lg:grid-cols-4" : "lg:grid-cols-3"} sm:grid-cols-2`}>
        {subjects.map(({ subject, syllabusStats, practiceStats, practiceHref }) => (
          <div
            key={subject.id}
            className="group rounded-2xl border border-line bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-30px_rgba(27,26,24,0.35)]"
          >
            <div className="flex items-center gap-3">
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${subject.accent.tile}`}>
                <subject.icon className="size-5" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold tracking-tight text-ink">{subject.name}</h3>
                <p className="text-xs text-ink-muted">{syllabusStats.completed} / {syllabusStats.total} topics</p>
              </div>
              <span className="shrink-0 font-display text-lg font-medium text-ink">{syllabusStats.percent}%</span>
            </div>
            <ProgressBar
              percent={syllabusStats.percent}
              label={`${subject.name} syllabus: ${syllabusStats.percent}%`}
              className="mt-3 h-1.5"
              barClassName={subject.accent.bar}
            />

            {/* practice row — only for subjects with a practice system */}
            {practiceStats && practiceHref && (
              <Link
                href={practiceHref}
                onClick={(e) => e.stopPropagation()}
                className="mt-3 flex items-center justify-between gap-2 border-t border-line/60 pt-3 text-xs"
              >
                <span className="font-medium text-ink-soft">
                  Practice
                </span>
                <span className="font-medium text-ink-muted">
                  {practiceStats.completed} / {practiceStats.total} · {practiceStats.percent}%
                </span>
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
