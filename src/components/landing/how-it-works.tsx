import { steps } from "@/lib/site";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

/*
  The 4-step journey, shown as numbered milestones.
  Numbers use the serif display font for an editorial feel.
*/
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-y border-line/70 bg-surface py-20 sm:py-28"
    >
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="From day one to results day"
            description="No setup marathons. Four small steps and StudyOS starts working for you."
          />
        </Reveal>

        <ol className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {/* dashed connector across the steps (desktop only) */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-7 hidden border-t-2 border-dashed border-line lg:block"
          />

          {steps.map((step, index) => (
            <li key={step.number} className="relative">
              <Reveal delay={index * 100}>
                <span className="relative z-10 inline-grid size-14 place-items-center rounded-2xl border border-pine-200 bg-canvas font-display text-xl italic text-pine-700">
                  {step.number}
                </span>
                <h3 className="mt-5 text-[17px] font-semibold tracking-tight text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                  {step.description}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
