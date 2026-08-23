import { Check } from "lucide-react";
import type { Topic, TopicStatus } from "@/lib/syllabus/types";

/*
  One tappable topic row. The WHOLE row is the checkbox
  (role="checkbox"), so the tap target is generous on phones.
*/
export function TopicRow({
  topic,
  status,
  onToggle,
}: {
  topic: Topic;
  status: TopicStatus;
  onToggle: () => void;
}) {
  const done = status === "completed";

  return (
    <li>
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        onClick={onToggle}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors duration-150 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-pine-600 active:bg-pine-50"
      >
        {/* custom checkbox */}
        <span
          aria-hidden
          className={`grid size-5 shrink-0 place-items-center rounded-md border-2 transition-all duration-150 ${
            done
              ? "border-pine-600 bg-pine-600"
              : "border-line bg-surface group-hover:border-pine-200"
          }`}
        >
          {done && <Check className="size-3.5 text-white" strokeWidth={3.5} />}
        </span>

        <span
          className={`min-w-0 flex-1 truncate text-[15px] transition-colors ${
            done
              ? "text-ink-muted line-through decoration-line"
              : "text-ink"
          }`}
        >
          {topic.name}
        </span>

        {/* status pill */}
        <span
          className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline-flex ${
            done
              ? "bg-pine-50 text-pine-700"
              : "border border-line bg-canvas text-ink-muted"
          }`}
        >
          {done ? "Completed" : "Not Started"}
        </span>
      </button>
    </li>
  );
}
