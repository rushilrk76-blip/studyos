"use client";

import { useEffect, useState } from "react";
import {
  Award,
  BookOpenCheck,
  ExternalLink,
  GraduationCap,
  Share2,
  Sigma,
  TrendingUp,
  X,
} from "lucide-react";
import type { PortfolioSummary } from "@/lib/portfolio/summary";
import { SUBJECTS } from "@/lib/subjects";
import { getBoard, getStream } from "@/lib/student";
import { calcPercentage, formatExamDate } from "@/lib/marks/results";
import { Button } from "@/components/ui/button";

/*
  A clean, professional portfolio presentation — no editing
  controls. Designed for sharing with teachers, parents or
  mentors. Reads entirely from the derived PortfolioSummary.

  Not an official school document — stated in the footer.
*/

export function PortfolioPreview({
  summary,
  onClose,
}: {
  summary: PortfolioSummary;
  onClose: () => void;
}) {
  const [shared, setShared] = useState(false);

  async function handleShare() {
    const shareData = {
      title: `${summary.profile.name} — StudyOS Portfolio`,
      text: `${summary.profile.name}'s Class 12 academic portfolio on StudyOS.`,
      url: typeof window !== "undefined" ? window.location.origin : "",
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user cancelled — no action needed */
      }
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareData.url || shareData.text);
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      } catch {
        /* clipboard blocked — silently ignore */
      }
    }
  }

  /* Lock body scroll while preview is open. */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const board = getBoard(summary.profile.board);
  const stream = getStream(summary.profile.stream);
  const unlocked = summary.achievements.filter((a) => a.unlocked);
  const firstName = summary.profile.name.trim().split(/\s+/)[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/50 backdrop-blur-sm">
      <div className="mx-auto min-h-full max-w-3xl px-3 py-6 sm:px-6 sm:py-10">
        {/* toolbar */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-white/80">
            Portfolio Preview
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="md"
              variant="secondary"
              className="bg-white/90"
              onClick={handleShare}
            >
              <Share2 className="size-4" />
              {shared ? "Link copied!" : "Share"}
            </Button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="grid size-10 place-items-center rounded-full bg-white/90 text-ink transition-colors hover:bg-white"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* ── the portfolio document ── */}
        <div className="overflow-hidden rounded-3xl border border-line bg-canvas shadow-2xl">
          {/* header banner */}
          <header className="dot-grid relative border-b border-line bg-pine-900 px-6 py-10 text-center sm:px-10 sm:py-14">
            <div className="relative flex flex-col items-center gap-4">
              <span className="grid size-20 overflow-hidden rounded-full border-4 border-white/15 bg-white/10 sm:size-24">
                {summary.profile.photoDataUrl ? (
                  <img
                    src={summary.profile.photoDataUrl}
                    alt={summary.profile.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="grid size-full place-items-center font-display text-3xl font-medium text-white sm:text-4xl">
                    {firstName[0]?.toUpperCase()}
                  </span>
                )}
              </span>
              <div>
                <h1 className="font-display text-2xl font-medium tracking-tight text-white sm:text-3xl">
                  {summary.profile.name}
                </h1>
                <p className="mt-1.5 text-sm text-white/70">
                  Class 12 · {board.name} · {stream.name}
                </p>
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/90">
                  <GraduationCap className="size-3.5" />
                  {summary.studentId}
                </p>
              </div>
            </div>
          </header>

          <div className="space-y-8 p-6 sm:p-10">
            {/* overview */}
            <section>
              <SectionHeading icon={<TrendingUp className="size-4" />} label="Academic Overview" />
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatTile label="Syllabus" value={`${summary.syllabusOverall.percent}%`} sub={`${summary.syllabusOverall.completed} / ${summary.syllabusOverall.total} topics`} />
                <StatTile label="Test Average" value={summary.marks.hasResults ? `${summary.marks.averagePercent}%` : "—"} sub={`${summary.marks.tests} test${summary.marks.tests === 1 ? "" : "s"}`} />
                <StatTile label="Homework" value={`${summary.homework.percent}%`} sub={`${summary.homework.completed} / ${summary.homework.total} done`} />
              </div>
            </section>

            {/* syllabus progress */}
            <section>
              <SectionHeading icon={<BookOpenCheck className="size-4" />} label="Syllabus Progress" />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {summary.subjects.map((subject) => (
                  <SubjectRow key={subject.subjectId} name={subject.name} percent={subject.syllabusPercent} accent={subject.accent.bar} />
                ))}
              </div>
            </section>

            {/* subject performance */}
            {summary.marks.hasResults && summary.marks.bySubject.length > 0 && (
              <section>
                <SectionHeading icon={<Award className="size-4" />} label="Subject Performance" />
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {summary.marks.bySubject.map((sub) => (
                    <div key={sub.subject} className="rounded-2xl border border-line bg-surface p-4">
                      <p className="font-semibold text-ink">{sub.subject}</p>
                      <div className="mt-2 flex gap-4 text-sm">
                        <span className="text-ink-soft">Avg <strong className="text-ink">{sub.averagePercent}%</strong></span>
                        <span className="text-ink-soft">Best <strong className="text-pine-700">{sub.bestPercent}%</strong></span>
                        <span className="text-ink-muted">{sub.tests} test{sub.tests === 1 ? "" : "s"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* practice */}
            <section>
              <SectionHeading icon={<Sigma className="size-4" />} label="Practice Progress" />
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {summary.practice.map((entry) => (
                  <StatTile key={entry.name} label={entry.name} value={`${entry.percent}%`} sub={`${entry.completed} / ${entry.total}`} />
                ))}
              </div>
            </section>

            {/* achievements */}
            {unlocked.length > 0 && (
              <section>
                <SectionHeading icon={<Award className="size-4" />} label="Achievements" />
                <div className="mt-4 flex flex-wrap gap-2">
                  {unlocked.map((achievement) => (
                    <span key={achievement.id} className="inline-flex items-center gap-1.5 rounded-full border border-pine-200 bg-pine-50 px-3 py-1.5 text-xs font-semibold text-pine-700">
                      <Award className="size-3.5" />
                      {achievement.title}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* projects */}
            {summary.projects.length > 0 && (
              <section>
                <SectionHeading label="Projects" />
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {summary.projects.map((project) => (
                    <div key={project.id} className="rounded-2xl border border-line bg-surface p-4">
                      <p className="font-semibold text-ink">{project.title}</p>
                      <p className="mt-0.5 text-xs text-ink-muted">{project.subject}{project.date ? ` · ${project.date}` : ""}</p>
                      {project.description && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{project.description}</p>}
                      {project.link && (
                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-pine-600 hover:underline">
                          <ExternalLink className="size-3" /> View link
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* certificates */}
            {summary.certificates.length > 0 && (
              <section>
                <SectionHeading label="Certificates & Achievements" />
                <div className="mt-4 space-y-2">
                  {summary.certificates.map((cert) => (
                    <div key={cert.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-pine-50 text-pine-600">
                        <Award className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-ink">{cert.title}</p>
                        <p className="truncate text-xs text-ink-muted">
                          {cert.organization}{cert.date ? ` · ${cert.date}` : ""}
                        </p>
                      </div>
                      {cert.link && (
                        <a href={cert.link} target="_blank" rel="noopener noreferrer" className="shrink-0 text-ink-muted transition-colors hover:text-pine-600">
                          <ExternalLink className="size-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* footer */}
          <footer className="border-t border-line bg-canvas px-6 py-5 text-center sm:px-10">
            <p className="text-xs text-ink-muted">
              Generated by StudyOS · {new Date().getFullYear()} · This portfolio is a
              personal academic summary, not an official school or board document.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

/* ── small shared pieces for the preview ── */

function SectionHeading({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon && <span className="text-pine-600">{icon}</span>}
      <h2 className="text-base font-bold uppercase tracking-[0.1em] text-ink">
        {label}
      </h2>
    </div>
  );
}

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-medium text-ink">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-ink-muted">{sub}</p>}
    </div>
  );
}

function SubjectRow({ name, percent, accent }: { name: string; percent: number; accent: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate font-semibold text-ink">{name}</p>
        <p className="shrink-0 font-display text-lg font-medium text-ink">{percent}%</p>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-line/60">
        <div className={`h-full rounded-full transition-all duration-500 ${accent}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
