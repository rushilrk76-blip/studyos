import Link from "next/link";
import type { Metadata } from "next";
import { Compass } from "lucide-react";
import { routes } from "@/lib/site";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/layout/logo";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas">
      <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden />

      <header className="relative border-b border-line/60 bg-canvas/80 backdrop-blur-sm">
        <Container className="flex h-16 items-center">
          <Logo />
        </Container>
      </header>

      <main className="relative">
        <Container className="grid min-h-[calc(100vh-4rem)] place-items-center pb-20 pt-16 text-center">
          <div>
            <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-pine-600 text-white shadow-[0_16px_35px_-14px_rgba(23,113,83,0.7)]">
              <Compass className="size-8" strokeWidth={1.8} />
            </span>
            <p className="mt-6 text-6xl font-display font-medium tracking-tight text-ink sm:text-7xl">
              404
            </p>
            <h1 className="mt-3 font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">
              Page not found
            </h1>
            <p className="mx-auto mt-3 max-w-sm leading-relaxed text-ink-soft">
              Let&apos;s get you back to your studies.
            </p>
            <Link
              href={routes.dashboard}
              className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-pine-600 px-6 text-[15px] font-medium text-white transition-colors hover:bg-pine-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-600"
            >
              Go to Dashboard
            </Link>
          </div>
        </Container>
      </main>
    </div>
  );
}
