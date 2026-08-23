/*
  A single accessible progress bar, shared by the practice screens.
  Keeps the look consistent and the aria attributes correct.
*/
export function ProgressBar({
  percent,
  label,
  className = "",
  barClassName = "bg-pine-600",
}: {
  percent: number;
  label: string;
  className?: string;
  barClassName?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`h-2 overflow-hidden rounded-full bg-line/60 ${className}`}
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ${barClassName}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
