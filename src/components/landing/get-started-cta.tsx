import { ArrowRight, GraduationCap } from "lucide-react";
import { routes } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

/*
  Closing call-to-action band.
  Sends visitors into the real onboarding flow at /get-started.
*/
export function GetStartedCta() {
  return (
    <section id="get-started" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <Reveal>
          <div className="dot-grid relative overflow-hidden rounded-[2.5rem] bg-pine-900 px-7 py-14 text-center sm:px-12 sm:py-20">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white/10 text-sun-400">
              <GraduationCap className="size-7" />
            </span>

            <h2 className="mx-auto mt-6 max-w-2xl font-display text-3xl font-medium tracking-tight text-white sm:text-[2.75rem] sm:leading-[1.12]">
              Start your setup in under a minute.
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-white/70">
              Pick your board, pick your stream, add your name — that&apos;s
              it. Your Class 12 workspace starts taking shape immediately. No
              email or password needed yet.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                href={routes.getStarted}
                size="lg"
                className="bg-white text-pine-900 hover:bg-pine-50"
              >
                Get Started
                <ArrowRight className="size-4" />
              </Button>
              <Button
                href={routes.howItWorks}
                size="lg"
                variant="ghost"
                className="text-white/80 hover:bg-white/10 hover:text-white"
              >
                See How It Works
              </Button>
            </div>

            <p className="mt-7 text-sm text-white/50">
              Free · CBSE &amp; RBSE · PCM, PCB &amp; PCMB
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
