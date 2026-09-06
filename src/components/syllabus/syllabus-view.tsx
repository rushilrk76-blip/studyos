"use client";

import { useEffect, useMemo, useState } from "react";
import { Info, SearchX } from "lucide-react";
import { getBoard, getStream } from "@/lib/student";
import { SUBJECTS } from "@/lib/subjects";
import { getSyllabus } from "@/data/syllabus";
import {
  calculateOverallProgress,
  calculateTopicProgress,
  withTopicToggled,
} from "@/lib/syllabus/progress";
import { syllabusService } from "@/services";
import {
  getSyllabusProgressCloud,
  toggleSyllabusTopicCloud,
} from "@/services/cloud-data-service";
import type {
  SubjectFilter,
  TopicFilter,
  TopicProgress,
} from "@/lib/syllabus/types";
import { useStudent } from "@/components/app/student-context";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { OverallProgress } from "@/components/syllabus/overall-progress";
import { SyllabusControls } from "@/components/syllabus/syllabus-controls";
import { SubjectCard } from "@/components/syllabus/subject-card";

/*
  ────────────────────────────────────────────────
  The syllabus page body.

  State flow:
    localStorage ──load──▶ progress (state)
    toggle topic ──▶ withTopicToggled() ──▶ state ──▶ save
    progress + syllabus ──▶ calculate*Progress() ──▶ UI

  The syllabus itself is static application data (src/data/syllabus),
  imported once. Only the small progress record lives in storage.
  ────────────────────────────────────────────────
*/
export function SyllabusView() {
  const student = useStudent();
  const [progress, setProgress] = useState<TopicProgress | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<TopicFilter>("all");
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>("all");

  /* Load saved progress once, on the client. */
useEffect(() => {
  const loadProgress = async () => {
    const cloudProgress = await getSyllabusProgressCloud();

    if (Object.keys(cloudProgress).length > 0) {
      setProgress(cloudProgress);
    } else {
      setProgress(syllabusService.getProgress());
    }
  };

  void loadProgress();
}, []);

  /* Persist every change. */
  useEffect(() => {
    if (progress) syllabusService.saveProgress(progress);
  }, [progress]);
  const handleToggleTopic = async (topicId: string) => {
    const currentCompleted = progress?.[topicId] === "completed";

    setProgress((current) =>
      withTopicToggled(current ?? {}, topicId),
    );

    await toggleSyllabusTopicCloud(topicId, currentCompleted);
  };
  /* The syllabus comes from the saved profile (board + stream). */
  const syllabus = useMemo(
    () =>
      student.status === "ready"
        ? getSyllabus(student.profile.board, student.profile.stream)
        : null,
    [student],
  );

  const overall = useMemo(
    () =>
      syllabus && progress
        ? calculateOverallProgress(syllabus, progress)
        : null,
    [syllabus, progress],
  );

  const normalizedQuery = query.trim().toLowerCase();
  const isSearchingOrStatus = normalizedQuery !== "" || filter !== "all";

  /* Apply subject + search + status filters. */
  const visibleSubjects = useMemo(() => {
    if (!syllabus || !progress) return [];
    return syllabus.subjects
      .filter(
        (subject) =>
          subjectFilter === "all" || subject.subjectId === subjectFilter,
      )
      .map((subject) => {
        const chapters = subject.chapters
          .map((chapter) => {
            const chapterMatches =
              normalizedQuery !== "" &&
              chapter.title.toLowerCase().includes(normalizedQuery);
            const topics = chapter.topics.filter((topic) => {
              const status = calculateTopicProgress(topic, progress);
              if (filter === "completed" && status !== "completed") return false;
              if (filter === "not-started" && status !== "not-started")
                return false;
              if (normalizedQuery === "" || chapterMatches) return true;
              return topic.name.toLowerCase().includes(normalizedQuery);
            });
            return { chapter, topics };
          })
          .filter(({ topics }) => !isSearchingOrStatus || topics.length > 0);
        return { subject, chapters };
      })
      .filter(({ chapters }) => !isSearchingOrStatus || chapters.length > 0);
  }, [syllabus, progress, normalizedQuery, filter, subjectFilter, isSearchingOrStatus]);

  const nothingFound = visibleSubjects.length === 0;

  if (student.status !== "ready" || !progress || !syllabus || !overall) {
    return <SyllabusSkeleton />;
  }

  const board = getBoard(student.profile.board);
  const stream = getStream(student.profile.stream);
  const streamSubjects = syllabus.subjects.map((s) => SUBJECTS[s.subjectId]);

  return (
    <div className="space-y-8">
      {/* ── header ─────────────────────────────────── */}
      <PageHeader
        title="Syllabus"
        description="Track your Class 12 syllabus and know exactly what is completed and what is remaining."
        badge={
          <p className="shrink-0 rounded-full border border-pine-200 bg-pine-50 px-4 py-1.5 text-sm font-bold text-pine-700">
            {board.name} · {stream.name}
          </p>
        }
      />

        {/* provenance note — students should know where this came from */}
        <Reveal>
        <p className="flex items-start gap-2.5 rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink-soft">
          <Info className="mt-0.5 size-4 shrink-0 text-pine-600" />
          <span>
            Topics are transcribed from the official{" "}
            <strong className="text-ink">{board.name}</strong> Class 12
            curriculum for {board.id === "cbse" ? "2025-26" : "session 2025-2026"}.
            Always cross-check against your school&apos;s copy before exams.
          </span>
        </p>
      </Reveal>

      {/* ── overall progress ───────────────────────── */}
      <Reveal delay={60}>
        <OverallProgress stats={overall} />
      </Reveal>

      {/* ── search + filters ───────────────────────── */}
      <Reveal delay={100}>
        <SyllabusControls
          query={query}
          filter={filter}
          subjectFilter={subjectFilter}
          subjects={streamSubjects}
          onQueryChange={setQuery}
          onFilterChange={setFilter}
          onSubjectFilterChange={setSubjectFilter}
        />
      </Reveal>

      {/* ── subjects ───────────────────────────────── */}
      {nothingFound ? (
        <div className="rounded-3xl border border-line bg-surface px-6 py-14 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-canvas text-ink-muted">
            <SearchX className="size-6" strokeWidth={1.9} />
          </span>
          <p className="mt-4 font-semibold text-ink">No topics match</p>
          <p className="mt-1 text-sm text-ink-soft">
            Try a different search term, or clear your filters.
          </p>
          <Button
            variant="secondary"
            className="mt-5"
            onClick={() => {
              setQuery("");
              setFilter("all");
              setSubjectFilter("all");
            }}
          >
            Clear search &amp; filters
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {visibleSubjects.map(({ subject, chapters }, index) => (
            <Reveal key={subject.subjectId} delay={index * 60}>
              <SubjectCard
                subjectSyllabus={subject}
                visibleChapters={chapters}
                progress={progress}
                forceOpen={isSearchingOrStatus}
                defaultOpen={subjectFilter !== "all"}
onToggleTopic={async (topicId) => {
  setProgress((current) => {
    const next = withTopicToggled(current ?? {}, topicId);

    void toggleSyllabusTopicCloud(
      topicId,
      current?.[topicId] === "completed",
    );

    return next;
  });
}}
              />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

function SyllabusSkeleton() {
  return (
    <div className="space-y-8" aria-hidden>
      <div>
        <span className="block h-9 w-40 animate-pulse rounded-lg bg-line" />
        <span className="mt-3 block h-5 w-96 max-w-full animate-pulse rounded bg-line/70" />
      </div>
      <span className="block h-44 animate-pulse rounded-3xl border border-line bg-surface" />
      <span className="block h-11 animate-pulse rounded-full border border-line bg-surface" />
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block h-24 animate-pulse rounded-3xl border border-line bg-surface"
        />
      ))}
    </div>
  );
}
