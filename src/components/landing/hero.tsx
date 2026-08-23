import { ArrowRight, BookOpenCheck, Sparkles } from "lucide-react";
import { routes, site } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { HeroPreview } from "@/components/landing/hero-preview";

/*
  Hero = the first thing a visitor sees.
  Left: headline + actions. Right: a static product illustration.
*/
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* subtle dot texture, no heavy gradients */}
      <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden />

      <Container className="relative">
        <div className="grid items-center gap-14 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-24">
          {/* Copy */}
          <div className="max-w-xl animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-pine-200 bg-pine-50 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-pine-700">
              <Sparkles className="size-3.5" />
              For CBSE &amp; RBSE · Class 12
            </p>

            <h1 className="mt-6 font-display text-[clamp(2.6rem,6vw,4.3rem)] font-medium leading-[1.06] tracking-tight text-ink">
              Your Class 12 Journey,{" "}
              <span className="relative whitespace-nowrap italic text-pine-600">
                Organized.
                {/* hand-drawn underline accent */}
                <svg
                  viewBox="0 0 220 14"
                  fill="none"
                  aria-hidden
                  className="absolute -bottom-2 left-0 w-full text-sun-400"
                >
                  <path
                    d="M4 10C60 4 150 3 216 8"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-7 text-lg leading-relaxed text-ink-soft">
              {site.description}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href={routes.getStarted} size="lg">
                Get Started
                <ArrowRight className="size-4" />
              </Button>
              <Button href={routes.howItWorks} variant="secondary" size="lg">
                <BookOpenCheck className="size-4 text-pine-600" />
                See How It Works
              </Button>
            </div>

            <ul className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-muted">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-pine-600" />
                Syllabus tracking
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-pine-600" />
                Homework &amp; marks
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-pine-600" />
                Auto-built portfolio
              </li>
            </ul>
          </div>

          {/* Static product illustration (purely visual — real data comes later) */}
          <div className="animate-fade-in [animation-delay:150ms]">
            <HeroPreview />
          </div>
        </div>
      </Container>
    </section>
  );
}
