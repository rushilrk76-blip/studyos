/*
  The consistent header used above each landing section:
  a small uppercase "eyebrow" label, a serif title, and an optional lede.
*/
export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pine-600">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink sm:text-[2.6rem] sm:leading-[1.15]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-ink-soft">
          {description}
        </p>
      ) : null}
    </div>
  );
}
