import { BOARDS, type BoardId } from "@/lib/student";
import { SelectionCard } from "@/components/onboarding/selection-card";

/* Step 1 — "Choose Your Board" (CBSE or RBSE). */
export function StepBoard({
  value,
  onChange,
}: {
  value: BoardId | null;
  onChange: (board: BoardId) => void;
}) {
  return (
    <section aria-labelledby="board-heading">
      <h2
        id="board-heading"
        className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl"
      >
        Choose Your Board
      </h2>
      <p className="mt-2 text-ink-soft">
        This decides which curriculum StudyOS prepares for you.
      </p>

      <div
        role="radiogroup"
        aria-label="Board"
        className="mt-8 grid gap-4 sm:grid-cols-2"
      >
        {BOARDS.map((board) => (
          <SelectionCard
            key={board.id}
            icon={board.icon}
            title={board.name}
            description={board.description}
            selected={value === board.id}
            onSelect={() => onChange(board.id)}
          />
        ))}
      </div>

      {!value && (
        <p className="mt-5 text-sm text-ink-muted">
          Select your board to continue.
        </p>
      )}
    </section>
  );
}
