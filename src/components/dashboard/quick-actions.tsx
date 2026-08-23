import Link from "next/link";
import {
  ArrowUpRight,
  Award,
  BookOpenCheck,
  ListPlus,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { SectionTitle } from "@/components/dashboard/section-title";

type Action = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

/*
  Four shortcuts into the main sections. Each links to its real
  route — which currently shows a "coming next" placeholder until
  that module is built.
*/
const ACTIONS: Action[] = [
  {
    href: "/syllabus",
    label: "View Syllabus",
    description: "See your topics",
    icon: BookOpenCheck,
  },
  {
    href: "/homework",
    label: "Add Homework",
    description: "Capture a task",
    icon: ListPlus,
  },
  {
    href: "/marks",
    label: "Add Marks",
    description: "Record a test",
    icon: TrendingUp,
  },
  {
    href: "/portfolio",
    label: "View Portfolio",
    description: "Your profile",
    icon: Award,
  },
];

export function QuickActions() {
  return (
    <section aria-labelledby="quick-actions-heading">
      <SectionTitle id="quick-actions-heading" title="Quick Actions" />

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group relative rounded-2xl border border-line bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-pine-200 hover:shadow-[0_20px_45px_-30px_rgba(23,113,83,0.4)]"
          >
            <ArrowUpRight className="absolute right-4 top-4 size-4 text-ink-muted opacity-0 transition-all duration-200 group-hover:text-pine-600 group-hover:opacity-100" />
            <span className="grid size-10 place-items-center rounded-xl bg-pine-50 text-pine-600 transition-colors duration-200 group-hover:bg-pine-600 group-hover:text-white">
              <action.icon className="size-5" strokeWidth={2} />
            </span>
            <p className="mt-3.5 text-sm font-semibold tracking-tight text-ink">
              {action.label}
            </p>
            <p className="text-xs text-ink-muted">{action.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
