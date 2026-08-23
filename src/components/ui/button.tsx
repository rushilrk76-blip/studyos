import Link from "next/link";
import type { ReactNode } from "react";

/*
  One button look for the whole app.
  - variant: how it looks (primary / secondary / ghost)
  - size:    how big it is (md / lg)
  - href:    if provided, it renders as a link instead of <button>
  - onClick / disabled: standard button behaviour when there's no href
*/
type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-600 disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary:
    "bg-pine-600 text-white shadow-[0_8px_20px_-8px_rgba(23,113,83,0.55)] hover:bg-pine-700 hover:shadow-[0_10px_24px_-8px_rgba(17,92,67,0.6)]",
  secondary:
    "border border-line bg-surface text-ink hover:border-ink/25 hover:bg-canvas",
  ghost: "text-ink-soft hover:bg-ink/5 hover:text-ink",
} as const;

const sizes = {
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
} as const;

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  type = "button",
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
