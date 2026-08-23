import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/*
  Shared empty state — icon, title, guidance text, and one
  clear action button. Used across homework, marks, planner,
  portfolio, search instead of each page building its own.
*/
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}) {
  return (
    <div className="rounded-3xl border border-line bg-surface px-6 py-14 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-pine-50 text-pine-600">
        <Icon className="size-7" strokeWidth={1.8} />
      </span>
      <p className="mt-4 font-display text-xl font-medium tracking-tight text-ink">
        {title}
      </p>
      <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-ink-soft">
        {description}
      </p>
      {actionLabel &&
        (actionHref ? (
          <Button href={actionHref} className="mt-5">
            {actionLabel}
          </Button>
        ) : (
          <Button className="mt-5" onClick={onAction}>
            {actionLabel}
          </Button>
        ))}
    </div>
  );
}
