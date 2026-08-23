import { Check, type LucideIcon } from "lucide-react";

/*
  The big tappable card used in steps 1 & 2.
  Behaves like a radio button: role="radio" + aria-checked,
  so screen readers announce it inside the radiogroup.
*/
export function SelectionCard({
  icon: Icon,
  title,
  description,
  chips,
  selected,
  onSelect,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  chips?: string[];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`group relative flex min-h-36 w-full flex-col items-start gap-3 rounded-3xl border-2 p-6 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:scale-[0.99] ${
        selected
          ? "border-pine-600 bg-pine-50 shadow-[0_20px_45px_-26px_rgba(23,113,83,0.5)]"
          : "border-line bg-surface hover:-translate-y-0.5 hover:border-pine-200 hover:shadow-[0_20px_45px_-32px_rgba(27,26,24,0.4)]"
      }`}
    >
      {/* selected checkmark */}
      {selected && (
        <span className="absolute right-4 top-4 grid size-6 animate-pop place-items-center rounded-full bg-pine-600 text-white">
          <Check className="size-4" strokeWidth={3} />
        </span>
      )}

      <span
        className={`grid size-11 place-items-center rounded-2xl transition-colors duration-200 ${
          selected
            ? "bg-pine-600 text-white"
            : "bg-pine-50 text-pine-600 group-hover:bg-pine-100"
        }`}
      >
        <Icon className="size-6" strokeWidth={2} />
      </span>

      <span>
        <span className="block text-lg font-bold tracking-tight text-ink">
          {title}
        </span>
        <span className="mt-1 block text-sm leading-snug text-ink-soft">
          {description}
        </span>
      </span>

      {chips ? (
        <span className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {chips.map((chip) => (
            <span
              key={chip}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                selected
                  ? "border-pine-200 bg-white text-pine-700"
                  : "border-line bg-canvas text-ink-soft"
              }`}
            >
              {chip}
            </span>
          ))}
        </span>
      ) : null}
    </button>
  );
}
