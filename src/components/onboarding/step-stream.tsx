import { STREAMS, type StreamId } from "@/lib/student";
import { SelectionCard } from "@/components/onboarding/selection-card";

/* Step 2 — "Choose Your Stream" (PCM, PCB, or PCMB). */
export function StepStream({
  value,
  onChange,
}: {
  value: StreamId | null;
  onChange: (stream: StreamId) => void;
}) {
  return (
    <section aria-labelledby="stream-heading">
      <h2
        id="stream-heading"
        className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl"
      >
        Choose Your Stream
      </h2>
      <p className="mt-2 text-ink-soft">
        Your subjects, your syllabus — pick the combination you&apos;re
        enrolled in.
      </p>

      <div
        role="radiogroup"
        aria-label="Stream"
        className="mt-8 grid gap-4 sm:grid-cols-3"
      >
        {STREAMS.map((stream) => (
          <SelectionCard
            key={stream.id}
            icon={stream.icon}
            title={stream.name}
            description={stream.description}
            chips={[...stream.subjects]}
            selected={value === stream.id}
            onSelect={() => onChange(stream.id)}
          />
        ))}
      </div>

      {!value && (
        <p className="mt-5 text-sm text-ink-muted">
          Select your stream to continue.
        </p>
      )}
    </section>
  );
}
