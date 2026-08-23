import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/reveal";

/*
  Shared page header — identical typography and layout on
  every app page: serif title, muted subtitle, optional
  trailing badge and action area.

  Replaces the hand-built header blocks that repeated the
  same classes on 7+ pages.
*/
export function PageHeader({
  title,
  description,
  badge,
  action,
}: {
  title: string;
  description: string;
  badge?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Reveal>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-lg leading-relaxed text-ink-soft">
            {description}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {badge}
          {action}
        </div>
      </div>
    </Reveal>
  );
}
