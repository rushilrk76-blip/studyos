import Link from "next/link";
import { ArrowRight, FolderOpen } from "lucide-react";
import { SectionTitle } from "@/components/dashboard/section-title";
import { ProgressBar } from "@/components/ui/progress-bar";

/*
  Dashboard "Your Portfolio" card — shows the completion
  percentage and links to the full portfolio page.
*/
export function PortfolioCard({ percent }: { percent: number }) {
  return (
    <section aria-labelledby="portfolio-heading">
      <SectionTitle
        id="portfolio-heading"
        title="Your Portfolio"
        description="Your complete academic profile, assembled automatically."
      />
      <Link
        href="/portfolio"
        className="group mt-5 block rounded-3xl border border-line bg-surface p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-30px_rgba(23,113,83,0.35)]"
      >
        <div className="flex items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-pine-600 text-white">
            <FolderOpen className="size-6" strokeWidth={1.9} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-3xl font-medium tracking-tight text-ink">
              {percent}%
            </p>
            <p className="text-sm text-ink-soft">Portfolio completion</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-pine-600 transition-transform duration-200 group-hover:translate-x-0.5">
            View Portfolio
            <ArrowRight className="size-4" />
          </span>
        </div>
        <ProgressBar
          percent={percent}
          label={`Portfolio completion: ${percent}%`}
          className="mt-5"
        />
      </Link>
    </section>
  );
}
