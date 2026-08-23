"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BookOpenCheck,
  Calendar,
  ExternalLink,
  Eye,
  FolderKanban,
  GraduationCap,
  MoreVertical,
  Pencil,
  Plus,
  Share2,
  Sigma,
  Trash2,
  TrendingUp,
  User,
} from "lucide-react";
import { getBoard, getStream } from "@/lib/student";
import { buildPortfolioSummary } from "@/lib/portfolio/summary";
import type { Certificate, Project } from "@/lib/portfolio/types";
import type { CertificateDraft, ProjectDraft } from "@/lib/portfolio/types";
import {
  syllabusService,
  practiceService,
  taskService,
  examService,
  portfolioService,
} from "@/services";

import type { TopicProgress } from "@/lib/syllabus/types";
import type { QuestionProgress } from "@/lib/practice/types";
import type { ConceptProgress } from "@/lib/practice/concept-types";
import type { Task } from "@/lib/homework/types";
import type { ExamResult } from "@/lib/marks/types";
import { useStudent } from "@/components/app/student-context";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ProjectForm } from "@/components/portfolio/project-form";
import { CertificateForm } from "@/components/portfolio/certificate-form";
import { PortfolioPreview } from "@/components/portfolio/portfolio-preview";

export function PortfolioView() {
  const student = useStudent();

  const [topicProgress, setTopicProgress] = useState<TopicProgress | null>(null);
  const [questionProgress, setQuestionProgress] = useState<QuestionProgress | null>(null);
  const [scienceProgress, setScienceProgress] = useState<ConceptProgress | null>(null);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [results, setResults] = useState<ExamResult[] | null>(null);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [certificates, setCertificates] = useState<Certificate[] | null>(null);

  const [showPreview, setShowPreview] = useState(false);
  const [projectForm, setProjectForm] = useState<{
    open: boolean;
    editing: Project | null;
  }>({ open: false, editing: null });
  const [certForm, setCertForm] = useState<{
    open: boolean;
    editing: Certificate | null;
  }>({ open: false, editing: null });
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "project" | "certificate";
    id: string;
  } | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setTopicProgress(syllabusService.getProgress());
          setQuestionProgress(practiceService.getMathsProgress());
          setScienceProgress(practiceService.getScienceProgress());
          setTasks(taskService.getTasks());
          setResults(examService.getResults());
          setProjects(portfolioService.getProjects());
          setCertificates(portfolioService.getCertificates());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  /* Persist projects/certs on every change. */
  useEffect(() => {
    if (projects) portfolioService.saveProjects(projects);
  }, [projects]);
  useEffect(() => {
    if (certificates) portfolioService.saveCertificates(certificates);
  }, [certificates]);

  const summary = useMemo(() => {
    if (
      student.status !== "ready" ||
      !topicProgress ||
      !questionProgress ||
      !scienceProgress ||
      !tasks ||
      !results ||
      !projects ||
      !certificates
    ) {
      return null;
    }
    return buildPortfolioSummary({
      profile: student.profile,
      topicProgress,
      questionProgress,
      scienceProgress,
      tasks,
      results,
      projects,
      certificates,
    });
  }, [
    student,
    topicProgress,
    questionProgress,
    scienceProgress,
    tasks,
    results,
    projects,
    certificates,
  ]);

  if (!summary) return <PortfolioSkeleton />;

  const board = getBoard(summary.profile.board);
  const stream = getStream(summary.profile.stream);
  const firstName = summary.profile.name.trim().split(/\s+/)[0];
  const unlockedAchievements = summary.achievements.filter((a) => a.unlocked);

  /* ── mutations ── */
  function handleProjectSubmit(draft: ProjectDraft) {
    setProjects((current) => {
      const list = current ?? [];
      if (projectForm.editing) {
        return list.map((p) =>
          p.id === projectForm.editing!.id ? { ...p, ...draft } : p,
        );
      }
      return [
        {
          id: portfolioService.createProjectId(),
          ...draft,
          createdAt: new Date().toISOString(),
        },
        ...list,
      ];
    });
    setProjectForm({ open: false, editing: null });
  }

  function handleCertSubmit(draft: CertificateDraft) {
    setCertificates((current) => {
      const list = current ?? [];
      if (certForm.editing) {
        return list.map((c) =>
          c.id === certForm.editing!.id ? { ...c, ...draft } : c,
        );
      }
      return [
        {
          id: portfolioService.createCertificateId(),
          ...draft,
          createdAt: new Date().toISOString(),
        },
        ...list,
      ];
    });
    setCertForm({ open: false, editing: null });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.type === "project") {
      setProjects((current) =>
        (current ?? []).filter((p) => p.id !== deleteTarget.id),
      );
    } else {
      setCertificates((current) =>
        (current ?? []).filter((c) => c.id !== deleteTarget.id),
      );
    }
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-8">
      {/* ── header ── */}
      <Reveal>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
              My Academic Portfolio
            </h1>
            <p className="mt-2 max-w-lg leading-relaxed text-ink-soft">
              Your Class 12 academic journey, organized in one profile.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="secondary" size="lg" onClick={() => setShowPreview(true)}>
              <Eye className="size-4" />
              Preview
            </Button>
          </div>
        </div>
      </Reveal>

      {/* ── profile header card ── */}
      <Reveal delay={50}>
        <section className="overflow-hidden rounded-3xl border border-line bg-surface">
          <div className="dot-grid border-b border-line bg-pine-900 px-6 py-8 sm:px-8">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
              <span className="grid size-20 shrink-0 overflow-hidden rounded-full border-4 border-white/15 bg-white/10 sm:size-24">
                {summary.profile.photoDataUrl ? (
                  <img src={summary.profile.photoDataUrl} alt="" className="size-full object-cover" />
                ) : (
                  <span className="grid size-full place-items-center font-display text-3xl font-medium text-white sm:text-4xl">
                    {firstName[0]?.toUpperCase() ?? <User className="size-8" />}
                  </span>
                )}
              </span>
              <div className="text-center sm:text-left">
                <h2 className="font-display text-2xl font-medium tracking-tight text-white sm:text-3xl">
                  {summary.profile.name}
                </h2>
                <p className="mt-1 text-sm text-white/70">
                  Class 12 · {board.name} · {stream.name}
                </p>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/90">
                  <GraduationCap className="size-3.5" />
                  {summary.studentId}
                </span>
              </div>
            </div>
          </div>
          {/* completion bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 sm:px-8">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Portfolio Completion
              </p>
              <ProgressBar
                percent={summary.completion.percent}
                label={`Portfolio completion: ${summary.completion.percent}%`}
                className="mt-2 h-1.5"
              />
            </div>
            <p className="shrink-0 font-display text-2xl font-medium text-pine-700">
              {summary.completion.percent}%
            </p>
          </div>
        </section>
      </Reveal>

      {/* ── academic overview ── */}
      <Reveal delay={80}>
        <section aria-labelledby="overview-heading">
          <SectionTitle id="overview-heading" title="Academic Overview" />
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <OverviewTile
              icon={<BookOpenCheck className="size-[18px]" />}
              label="Syllabus"
              value={`${summary.syllabusOverall.percent}%`}
              sub={`${summary.syllabusOverall.completed} / ${summary.syllabusOverall.total} topics`}
            />
            <OverviewTile
              icon={<TrendingUp className="size-[18px]" />}
              label="Test Average"
              value={summary.marks.hasResults ? `${summary.marks.averagePercent}%` : "—"}
              sub={`${summary.marks.tests} test${summary.marks.tests === 1 ? "" : "s"}`}
            />
            <OverviewTile
              icon={<BookOpenCheck className="size-[18px]" />}
              label="Homework Done"
              value={`${summary.homework.completed}`}
              sub={`${summary.homework.pending} pending`}
            />
            <OverviewTile
              icon={<TrendingUp className="size-[18px]" />}
              label="Best Score"
              value={summary.marks.hasResults ? `${summary.marks.bestPercent}%` : "—"}
              sub={summary.marks.hasResults ? "personal best" : "no tests yet"}
            />
          </div>
        </section>
      </Reveal>

      {/* ── syllabus progress ── */}
      <Reveal delay={110}>
        <section aria-labelledby="syllabus-heading">
          <SectionTitle id="syllabus-heading" title="Class 12 Syllabus Progress" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {summary.subjects.map((subject) => (
              <div key={subject.subjectId} className="rounded-2xl border border-line bg-surface p-4">
                <div className="flex items-center gap-3">
                  <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${subject.accent.tile}`}>
                    <subject.icon className="size-[18px]" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{subject.name}</p>
                    <p className="text-xs text-ink-muted">
                      {subject.syllabusStats.completed} / {subject.syllabusStats.total} topics
                    </p>
                  </div>
                  <p className="shrink-0 font-display text-lg font-medium text-ink">{subject.syllabusPercent}%</p>
                </div>
                <ProgressBar
                  percent={subject.syllabusPercent}
                  label={`${subject.name} syllabus: ${subject.syllabusPercent}%`}
                  className="mt-3 h-1.5"
                  barClassName={subject.accent.bar}
                />
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ── practice progress ── */}
      <Reveal delay={130}>
        <section aria-labelledby="practice-heading">
          <SectionTitle id="practice-heading" title="Practice Progress" />
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {summary.practice.map((entry) => (
              <div key={entry.name} className="rounded-2xl border border-line bg-surface p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{entry.name}</p>
                <p className="mt-1 font-display text-2xl font-medium text-ink">{entry.completed} <span className="text-ink-muted">/ {entry.total}</span></p>
                <ProgressBar percent={entry.percent} label={`${entry.name}: ${entry.percent}%`} className="mt-2.5 h-1.5" barClassName="bg-pine-600" />
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ── subject performance ── */}
      <Reveal delay={150}>
        <section aria-labelledby="perf-heading">
          <SectionTitle id="perf-heading" title="Academic Performance" />
          {summary.marks.hasResults && summary.marks.bySubject.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
          ) : (
            <div className="mt-4 rounded-2xl border border-line bg-surface px-6 py-8 text-center">
              <p className="text-sm text-ink-muted">No test results yet. Add your first result in the Marks section.</p>
            </div>
          )}
        </section>
      </Reveal>

      {/* ── homework activity ── */}
      <Reveal delay={160}>
        <section aria-labelledby="hw-heading">
          <SectionTitle id="hw-heading" title="Study & Task Activity" />
          <div className="mt-4 rounded-2xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-display text-3xl font-medium text-ink">{summary.homework.percent}%</p>
                <p className="text-sm text-ink-soft">Homework completion</p>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-ink-soft">Completed <strong className="text-pine-700">{summary.homework.completed}</strong></span>
                <span className="text-ink-soft">Pending <strong className="text-ink">{summary.homework.pending}</strong></span>
                <span className="text-ink-muted">Total {summary.homework.total}</span>
              </div>
            </div>
            <ProgressBar percent={summary.homework.percent} label={`Homework completion: ${summary.homework.percent}%`} className="mt-4" />
          </div>
        </section>
      </Reveal>

      {/* ── achievements ── */}
      <Reveal delay={170}>
        <section aria-labelledby="ach-heading">
          <SectionTitle id="ach-heading" title="Achievements" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {summary.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`rounded-2xl border p-4 transition-all duration-200 ${
                  achievement.unlocked
                    ? "border-pine-200 bg-pine-50"
                    : "border-line bg-canvas/40 opacity-60"
                }`}
              >
                <span className={`grid size-9 place-items-center rounded-lg ${
                  achievement.unlocked ? "bg-pine-600 text-white" : "bg-line text-ink-muted"
                }`}>
                  <Award className="size-[18px]" strokeWidth={2} />
                </span>
                <p className={`mt-3 text-sm font-semibold ${achievement.unlocked ? "text-pine-700" : "text-ink-muted"}`}>
                  {achievement.title}
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">{achievement.description}</p>
                {!achievement.unlocked && (
                  <p className="mt-2 text-[11px] font-medium text-ink-muted">Locked</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ── projects ── */}
      <Reveal delay={180}>
        <section aria-labelledby="projects-heading">
          <div className="flex items-end justify-between gap-3">
            <SectionTitle id="projects-heading" title="Projects" />
            <Button
              variant="secondary"
              size="md"
              onClick={() => setProjectForm({ open: true, editing: null })}
            >
              <Plus className="size-4" />
              Add Project
            </Button>
          </div>
          <div className="mt-4">
            {summary.projects.length === 0 ? (
              <EmptySection text="No projects added yet." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {summary.projects.map((project) => (
                  <RecordCard
                    key={project.id}
                    icon={<FolderKanban className="size-[18px]" />}
                    title={project.title}
                    subtitle={`${project.subject}${project.date ? ` · ${project.date}` : ""}`}
                    description={project.description}
                    link={project.link}
                    onEdit={() => setProjectForm({ open: true, editing: project })}
                    onDelete={() => setDeleteTarget({ type: "project", id: project.id })}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </Reveal>

      {/* ── certificates ── */}
      <Reveal delay={190}>
        <section aria-labelledby="certs-heading">
          <div className="flex items-end justify-between gap-3">
            <SectionTitle id="certs-heading" title="Certificates & Achievements" />
            <Button
              variant="secondary"
              size="md"
              onClick={() => setCertForm({ open: true, editing: null })}
            >
              <Plus className="size-4" />
              Add Certificate
            </Button>
          </div>
          <div className="mt-4">
            {summary.certificates.length === 0 ? (
              <EmptySection text="No certificates added yet." />
            ) : (
              <div className="space-y-3">
                {summary.certificates.map((cert) => (
                  <RecordCard
                    key={cert.id}
                    icon={<Award className="size-[18px]" />}
                    title={cert.title}
                    subtitle={`${cert.organization}${cert.date ? ` · ${cert.date}` : ""}`}
                    link={cert.link}
                    onEdit={() => setCertForm({ open: true, editing: cert })}
                    onDelete={() => setDeleteTarget({ type: "certificate", id: cert.id })}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </Reveal>

      {/* ── modals ── */}
      {projectForm.open && student.status === "ready" && (
        <ProjectForm
          stream={student.profile.stream}
          editing={projectForm.editing}
          onSubmit={handleProjectSubmit}
          onClose={() => setProjectForm({ open: false, editing: null })}
        />
      )}
      {certForm.open && (
        <CertificateForm
          editing={certForm.editing}
          onSubmit={handleCertSubmit}
          onClose={() => setCertForm({ open: false, editing: null })}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmation
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
      {showPreview && (
        <PortfolioPreview summary={summary} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
}

/* ── shared small components ── */

function SectionTitle({ id, title }: { id?: string; title: string }) {
  return <h2 id={id} className="text-lg font-semibold tracking-tight text-ink">{title}</h2>;
}

function OverviewTile({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">{label}</p>
        <span className="text-pine-600">{icon}</span>
      </div>
      <p className="mt-2 font-display text-2xl font-medium text-ink">{value}</p>
      <p className="mt-0.5 text-xs text-ink-muted">{sub}</p>
    </div>
  );
}

function EmptySection({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-6 py-8 text-center">
      <p className="text-sm text-ink-muted">{text}</p>
    </div>
  );
}

function RecordCard({
  icon,
  title,
  subtitle,
  description,
  link,
  onEdit,
  onDelete,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description?: string;
  link?: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-pine-50 text-pine-600">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-ink">{title}</h3>
          <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>
          {description && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{description}</p>}
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-pine-600 hover:underline">
              <ExternalLink className="size-3" /> View link
            </a>
          )}
        </div>
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`Actions for ${title}`}
            className="grid size-9 place-items-center rounded-full text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <MoreVertical className="size-4" />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-20 mt-1 w-36 animate-pop rounded-2xl border border-line bg-surface p-1.5 shadow-lg"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => { setMenuOpen(false); onEdit(); }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <Pencil className="size-4" /> Edit
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => { setMenuOpen(false); onDelete(); }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ember transition-colors hover:bg-ember/5"
              >
                <Trash2 className="size-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmation({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="w-full max-w-sm animate-step-in rounded-3xl border border-line bg-surface p-6 text-center shadow-2xl">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-ember/10 text-ember">
          <Trash2 className="size-6" />
        </span>
        <p className="mt-4 font-display text-xl font-medium text-ink">Delete permanently?</p>
        <p className="mt-2 text-sm text-ink-soft">This action can&apos;t be undone.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="secondary" size="lg" onClick={onCancel}>Cancel</Button>
          <Button size="lg" className="bg-ember hover:bg-ember/90" onClick={onConfirm}>
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

function PortfolioSkeleton() {
  return (
    <div className="space-y-8" aria-hidden>
      <span className="block h-10 w-72 max-w-full animate-pulse rounded-lg bg-line" />
      <span className="block h-48 animate-pulse rounded-3xl border border-line bg-surface" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="h-24 animate-pulse rounded-2xl border border-line bg-surface" />
        ))}
      </div>
      <span className="block h-48 animate-pulse rounded-3xl border border-line bg-surface" />
    </div>
  );
}
