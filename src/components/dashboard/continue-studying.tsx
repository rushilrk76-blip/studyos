import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import type { StudyAction } from "@/lib/study-nav";
import { SUBJECTS } from "@/lib/subjects";

/*
  "Continue Studying" — a single, dynamically-calculated
  recommendation for what the student should do next.
  Based on real data via getNextStudyAction().
*/
export function ContinueStudying({ action }: { action: StudyAction }) {
  const icon = action.subjectIcon ? SUBJECTS[action.subjectIcon] : null;

  return (
    <Link
      href={action.href}
      className="group flex items-center gap-4 rounded-3xl border border-pine-200 bg-pine-50 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-28px_rgba(23,113,83,0.35)]"
    >
      <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${
        action.hasAction ? "bg-pine-600 text-white" : "bg-pine-100 text-pine-700"
      }`}>
        {action.hasAction && icon ? (
          <icon.icon className="size-6" strokeWidth={2} />
        ) : action.hasAction ? (
          <Sparkles className="size-6" strokeWidth={2} />
        ) : (
          <CheckCircle2 className="size-6" strokeWidth={2} />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-pine-700">
          {action.hasAction ? "Continue Studying" : "All Caught Up"}
        </p>
        <p className="mt-0.5 truncate font-semibold text-ink">{action.label}</p>
        <p className="truncate text-sm text-ink-soft">{action.detail}</p>
      </div>

      {action.hasAction && (
        <ArrowRight className="size-5 shrink-0 text-pine-600 transition-transform duration-200 group-hover:translate-x-0.5" />
      )}
    </Link>
  );
}
