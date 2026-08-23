/*
  ────────────────────────────────────────────────
  Portfolio data model.

  The portfolio itself is a VIEW of existing data — it derives
  syllabus %, marks averages, practice counts and homework stats
  from their original sources and never stores duplicate copies.

  Only two things are genuinely new, student-authored records:
    - Projects      (manually added)
    - Certificates  (manually added)

  Everything else comes from existing storage keys.
  ────────────────────────────────────────────────
*/

export type Project = {
  id: string;
  title: string;
  description: string;
  subject: string;
  date: string; // "YYYY-MM-DD"
  link: string; // optional URL
  createdAt: string;
};

export type Certificate = {
  id: string;
  title: string;
  organization: string;
  date: string; // "YYYY-MM-DD"
  link: string; // optional URL or image reference
  createdAt: string;
};

export type ProjectDraft = {
  title: string;
  description: string;
  subject: string;
  date: string;
  link: string;
};

export type CertificateDraft = {
  title: string;
  organization: string;
  date: string;
  link: string;
};

/* ── Achievements ───────────────────────────── */
export type AchievementId =
  | "first-topic"
  | "ten-topics"
  | "fifty-topics"
  | "first-test"
  | "ten-tests"
  | "fifty-questions"
  | "hundred-questions"
  | "first-homework";

export type Achievement = {
  id: AchievementId;
  title: string;
  description: string;
  /** Filled by buildPortfolioSummary — true only if condition is met. */
  unlocked: boolean;
};

/* ── Portfolio completion ───────────────────── */
export type PortfolioCompletion = {
  percent: number;
  /** Human-readable breakdown of what's contributing. */
  factors: { label: string; met: boolean }[];
};
