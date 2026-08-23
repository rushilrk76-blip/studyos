import { Award } from "lucide-react";
import type { Achievement } from "@/lib/portfolio/summary";
import { SectionTitle } from "@/components/dashboard/section-title";

/*
  Shows recently unlocked achievements on the dashboard.
  Only real achievements that the student has earned.
*/
export function AchievementsStrip({ achievements }: { achievements: Achievement[] }) {
  const unlocked = achievements.filter((a) => a.unlocked);
  if (unlocked.length === 0) return null;

  return (
    <section aria-labelledby="ach-heading">
      <SectionTitle id="ach-heading" title="Achievements" />
      <div className="mt-4 flex flex-wrap gap-2">
        {unlocked.map((a) => (
          <span
            key={a.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-pine-200 bg-pine-50 px-3 py-1.5 text-sm font-semibold text-pine-700"
          >
            <Award className="size-4" />
            {a.title}
          </span>
        ))}
      </div>
    </section>
  );
}
