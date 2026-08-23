import Link from "next/link";
import { navLinks, routes, site } from "@/lib/site";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/layout/logo";

/* Simple, honest footer: brand, navigation, and who StudyOS is for. */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line/70 bg-canvas">
      <Container className="py-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              {site.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
                Product
              </p>
              <ul className="mt-4 space-y-3">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-soft transition-colors hover:text-pine-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href={routes.getStarted}
                    className="text-sm text-ink-soft transition-colors hover:text-pine-600"
                  >
                    Get started
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
                Built for
              </p>
              <ul className="mt-4 space-y-3 text-sm text-ink-soft">
                <li>CBSE &amp; RBSE boards</li>
                <li>PCM · PCB · PCMB</li>
                <li>Class 12 students</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-line/70 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-ink-muted">
            © {year} {site.name}. All rights reserved.
          </p>
          <p className="text-xs text-ink-muted">
            Made for Class 12 students in India.
          </p>
        </div>
      </Container>
    </footer>
  );
}
