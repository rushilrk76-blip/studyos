/*
  "Step 1 of 3" indicator with a three-segment progress bar.
  Purely presentational — the flow component tells it which step we're on.
*/
export function SetupProgress({
  step,
  total,
  label,
}: {
  step: number; // 1-based
  total: number;
  label: string;
}) {
  return (
    <div>
      <p className="sr-only">
        Step {step} of {total}: {label}
      </p>
      <div className="flex items-baseline justify-between" aria-hidden>
        <p className="text-sm font-semibold text-ink">
          Step {step} of {total}
        </p>
        <p className="text-sm text-ink-muted">{label}</p>
      </div>
      <div className="mt-3 flex gap-2" aria-hidden>
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
              index < step ? "bg-pine-600" : "bg-line"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
