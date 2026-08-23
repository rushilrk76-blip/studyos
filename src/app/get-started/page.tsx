import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { routes } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/layout/logo";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export const metadata: Metadata = {
  title: "Get Started",
  description:
    "Choose your board, choose your stream, add your name — a 60-second setup for your Class 12 workspace.",
};

/*
  Minimal chrome on purpose: during onboarding the student should
  focus on one decision at a time, not navigate away.
*/
export default function GetStartedPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden />

      <header className="relative border-b border-line/60 bg-canvas/80 backdrop-blur-sm">
        <Container className="flex h-16 items-center justify-between">
          <Logo />
          <Button href={routes.home} variant="ghost" className="hidden sm:inline-flex">
            <ArrowLeft className="size-4" />
            Back to home
          </Button>
        </Container>
      </header>

      <main className="relative">
        <Container className="pb-16 pt-10 sm:pt-14">
          <OnboardingFlow />
        </Container>
      </main>
    </div>
  );
}
