import { features } from "@/lib/site";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

/*
  Four feature cards, rendered from the data in src/lib/site.ts.
  Adding a fifth feature later = adding one object to that array.
*/
export function Features() {
  return (
    <section id="features" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Features"
            title="Everything Class 12 demands, in one calm place"
            description="Four tools that work together — so you spend less time organizing and more time studying."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 80}>
              <article className="group h-full rounded-3xl border border-line bg-surface p-7 transition-all duration-300 hover:-translate-y-1 hover:border-pine-200 hover:shadow-[0_24px_50px_-28px_rgba(23,113,83,0.35)] sm:p-8">
                <span className="grid size-12 place-items-center rounded-2xl bg-pine-50 text-pine-600 transition-colors duration-300 group-hover:bg-pine-600 group-hover:text-white">
                  <feature.icon className="size-6" strokeWidth={1.9} />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">
                  {feature.title}
                </h3>
                <p className="mt-2 leading-relaxed text-ink-soft">
                  {feature.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
