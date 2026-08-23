"use client";

import { useEffect, useRef, type ReactNode } from "react";

/*
  A tiny scroll-animation wrapper.
  - Elements start invisible (the .reveal class in globals.css).
  - IntersectionObserver watches them; when they scroll into view,
    we add .reveal-visible and they fade/slide up.
  - `delay` (ms) lets us stagger items in a grid.
*/
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            element.classList.add("reveal-visible");
            observer.unobserve(element); // animate only once
          }
        });
      },
      { threshold: 0.15 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
