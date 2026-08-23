/* Small consistent heading used above each dashboard section. */
export function SectionTitle({
  id,
  title,
  description,
}: {
  id?: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h2
        id={id}
        className="text-lg font-semibold tracking-tight text-ink"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-sm text-ink-muted">{description}</p>
      ) : null}
    </div>
  );
}
