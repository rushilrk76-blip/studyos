import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { site } from "@/lib/site";

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-pine-600 text-white shadow-[0_6px_16px_-6px_rgba(23,113,83,0.6)] transition-transform duration-300 group-hover:-rotate-6">
        <GraduationCap className="size-5" strokeWidth={2.2} />
      </span>
      <span
        className={`text-[17px] font-bold tracking-tight ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        {site.name}
      </span>
    </Link>
  );
}
