"use client";

import { useCallback, useEffect, useState } from "react";
import { buildDashboard, type DashboardData } from "@/lib/dashboard";
import { getNextStudyAction } from "@/lib/study-nav";
import {
  syllabusService,
  practiceService,
  taskService,
  examService,
} from "@/services";
import type { ConceptProgress } from "@/lib/practice/concept-types";
import type { ExamResult } from "@/lib/marks/types";
import type { TopicProgress } from "@/lib/syllabus/types";
import type { QuestionProgress } from "@/lib/practice/types";
import type { Task } from "@/lib/homework/types";
import { useStudent } from "@/components/app/student-context";
import { Reveal } from "@/components/ui/reveal";
import { StatCards } from "@/components/dashboard/stat-cards";
import { ProgressHero } from "@/components/dashboard/progress-hero";
import { SubjectProgressSection } from "@/components/dashboard/subject-progress";
import { TasksPanel } from "@/components/dashboard/tasks-panel";
import { PracticeSummaryCard } from "@/components/dashboard/practice-summary-card";
import { MarksSummaryCard } from "@/components/dashboard/marks-summary-card";
import { PortfolioCard } from "@/components/dashboard/portfolio-card";
import { StudyNext } from "@/components/dashboard/study-next";
import { ContinueStudying } from "@/components/dashboard/continue-studying";
import { AchievementsStrip } from "@/components/dashboard/achievements-strip";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { PerformanceChart } from "@/components/marks/performance-chart";

/*
  ────────────────────────────────────────────────
  Dashboard 2.0 — the Class 12 command center.

  Reads from every system (syllabus, practice, homework, marks)
  and derives all statistics via buildDashboard(). Task toggles
  write back to the same localStorage the Homework page uses.
  ────────────────────────────────────────────────
*/
export function DashboardView() {
  const student = useStudent();
  const [topicProgress, setTopicProgress] = useState<TopicProgress | null>(null);
  const [questionProgress, setQuestionProgress] = useState<QuestionProgress | null>(null);
  const [sciencePractice, setSciencePractice] = useState<ConceptProgress | null>(null);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [results, setResults] = useState<ExamResult[] | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setTopicProgress(syllabusService.getProgress());
          setQuestionProgress(practiceService.getMathsProgress());
          setTasks(taskService.getTasks());
          setSciencePractice(practiceService.getScienceProgress());
          setResults(examService.getResults());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  /* Toggle task completion — writes to the same localStorage key as the Homework page. */
  const toggleTask = useCallback((id: string) => {
    /* Delegate to the service — single source of truth for persistence. */
    setTasks(taskService.toggleComplete(id));
  }, []);

  if (
    student.status !== "ready" ||
    topicProgress === null ||
    questionProgress === null ||
    tasks === null ||
    sciencePractice === null ||
    results === null
  ) {
    return <DashboardSkeleton />;
  }

  const data = buildDashboard(
    student.profile,
    new Date(),
    topicProgress,
    questionProgress,
    tasks,
    sciencePractice,
    results,
  );

  return (
    <div className="space-y-10">
      {/* 1. Greeting header */}
      <Reveal>
        <div>
          <h1 className="font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">
            {data.greeting},{" "}
            <span className="italic text-pine-700">{data.firstName}</span> 👋
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Class 12 · {data.boardName} · {data.streamName} · {data.dateString}
          </p>
        </div>
      </Reveal>

      {/* 2. Quick stats */}
      <Reveal delay={40}>
        <StatCards data={data} />
      </Reveal>

      {/* 3. Overall progress hero */}
      <ProgressHero data={data} />

      {/* Continue studying — smart recommendation */}
      <Reveal delay={60}>
        <ContinueStudying
          action={getNextStudyAction({
            board: student.profile.board,
            stream: student.profile.stream,
            tasks,
            topicProgress,
            questionProgress,
            scienceProgress: sciencePractice,
          })}
        />
      </Reveal>

      {/* 4. Two-column area: subjects + sidebar */}
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          {/* Subject progress */}
          <Reveal>
            <SubjectProgressSection subjects={data.subjects} />
          </Reveal>

          {/* Marks with trend */}
          <Reveal delay={60}>
            <MarksSummaryCard summary={data.marks} />
          </Reveal>

          {/* Marks trend chart */}
          {data.chartPoints.length >= 2 && (
            <Reveal delay={80}>
              <section className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
                <h2 className="text-sm font-semibold text-ink">Performance Trend</h2>
                <div className="mt-3">
                  <PerformanceChart points={data.chartPoints} />
                </div>
              </section>
            </Reveal>
          )}

          {/* Study next */}
          <Reveal delay={100}>
            <StudyNext suggestions={data.studySuggestions} />
          </Reveal>
        </div>

        {/* Sidebar column */}
        <div className="space-y-8">
          {/* Tasks */}
          <Reveal delay={60}>
            <TasksPanel
              todaysTasks={data.todaysTasks}
              overdueTasks={data.overdueTasks}
              upcomingTasks={data.upcomingTasks}
              onToggleTask={toggleTask}
            />
          </Reveal>

          {/* Practice summary */}
          <Reveal delay={80}>
            <PracticeSummaryCard summary={data.practice} />
          </Reveal>

          {/* Portfolio */}
          <Reveal delay={100}>
            <PortfolioCard percent={data.portfolioPercent} />
          </Reveal>

          {/* Achievements */}
          <Reveal delay={120}>
            <AchievementsStrip achievements={data.achievements} />
          </Reveal>
        </div>
      </div>

      {/* 5. Quick actions */}
      <Reveal delay={120}>
        <QuickActions />
      </Reveal>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-10" aria-hidden>
      <span className="block h-10 w-80 max-w-full animate-pulse rounded-lg bg-line" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="h-32 animate-pulse rounded-3xl border border-line bg-surface" />
        ))}
      </div>
      <span className="block h-40 animate-pulse rounded-3xl border border-line bg-surface" />
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <span className="block h-64 animate-pulse rounded-3xl border border-line bg-surface" />
        <span className="block h-48 animate-pulse rounded-3xl border border-line bg-surface" />
      </div>
    </div>
  );
}
