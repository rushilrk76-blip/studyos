"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { navLinks, routes } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/layout/logo";

/*
  Sticky top navigation.
  It's a client component only because the mobile menu needs useState.
*/
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-canvas/85 backdrop-blur-md">
      <Container>
        <nav
          className="flex h-16 items-center justify-between"
          aria-label="Main navigation"
        >
          <Logo />

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 md:flex">
            <Button href={routes.login} variant="ghost">
              Log in
            </Button>
            <Button href={routes.getStarted}>
              Get Started
              <ArrowRight className="size-4" />
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="grid size-10 place-items-center rounded-xl text-ink transition-colors hover:bg-ink/5 md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>
      </Container>

      {/* Mobile dropdown panel */}
      {menuOpen ? (
        <div className="border-t border-line/70 bg-canvas md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-[15px] font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-line/70 pt-4">
              <Button href={routes.login} variant="secondary">
                Log in
              </Button>
              <Button href={routes.getStarted}>
                Get Started
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
