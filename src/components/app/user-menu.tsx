"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Home, Pencil, Settings, User } from "lucide-react";
import { getBoard, getStream, type StudentProfile } from "@/lib/student";
import { routes } from "@/lib/site";

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

/*
  The avatar button in the header + its dropdown.
  Closes on outside click and on Escape.
*/
export function UserMenu({ profile }: { profile: StudentProfile }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const board = getBoard(profile.board);
  const stream = getStream(profile.stream);

  const menuItems = [
    { href: routes.getStarted, label: "Edit setup", icon: Pencil },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: routes.home, label: "Back to home", icon: Home },
  ];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open profile menu"
        className="flex items-center gap-1.5 rounded-full p-1 transition-colors hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-600"
      >
        <span className="grid size-9 place-items-center overflow-hidden rounded-full bg-pine-600 text-sm font-bold text-white">
          {profile.photoDataUrl ? (
            // plain <img>: data-URLs can't be optimized by next/image
            <img
              src={profile.photoDataUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : profile.name.trim() ? (
            initialsOf(profile.name)
          ) : (
            <User className="size-4" />
          )}
        </span>
        <ChevronDown
          className={`size-4 text-ink-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 animate-pop rounded-2xl border border-line bg-surface p-2 shadow-[0_24px_50px_-20px_rgba(27,26,24,0.35)]"
        >
          {/* who am I */}
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-ink">
              {profile.name}
            </p>
            <div className="mt-1.5 flex gap-1.5">
              <span className="rounded-full bg-pine-50 px-2 py-0.5 text-[11px] font-bold text-pine-700">
                {board.name}
              </span>
              <span className="rounded-full bg-pine-50 px-2 py-0.5 text-[11px] font-bold text-pine-700">
                {stream.name}
              </span>
            </div>
          </div>

          <div className="my-1 border-t border-line/70" role="separator" />

          {menuItems.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
