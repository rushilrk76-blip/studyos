import type { BoardId, StreamId } from "@/lib/student";
import { SUBJECTS, subjectsForStream } from "@/lib/subjects";
import { getSyllabus } from "@/data/syllabus";
import { calculateSubjectProgress } from "@/lib/syllabus/progress";
import type { TopicProgress } from "@/lib/syllabus/types";
import { getTodaysTasks, filterTasks, sortTasks, todayKey } from "@/lib/homework/tasks";
import type { Task } from "@/lib/homework/types";
import { buildPracticeSummary } from "@/lib/practice/summary";
import type { QuestionProgress } from "@/lib/practice/types";
import type { ConceptProgress } from "@/lib/practice/concept-types";

/*
  ────────────────────────────────────────────────
  Smart Study Navigation — getNextStudyAction().

  Determines the single most useful thing a student should
  do next, based on their actual data. Priority:

    1. Overdue homework  → link to homework
    2. Homework due today → link to homework
    3. First incomplete syllabus chapter → link to syllabus/practice
    4. Incomplete practice → link to practice
    5. Nothing → "You're all caught up!"

  Deterministic. No random suggestions. Read-only.
  ────────────────────────────────────────────────
*/

export type StudyAction = {
  label: string;         // e.g. "Continue Chemistry"
  detail: string;        // e.g. "Solutions · 3 topics remaining"
  href: string;          // where to navigate
  subjectIcon?: keyof typeof SUBJECTS;
  hasAction: boolean;    // false when there's nothing to do
};

export function getNextStudyAction(params: {
  board: BoardId;
  stream: StreamId;
  tasks: Task[];
  topicProgress: TopicProgress;
  questionProgress: QuestionProgress;
  scienceProgress: ConceptProgress;
}): StudyAction {
  const { board, stream, tasks, topicProgress, questionProgress, scienceProgress } = params;
  const today = todayKey();

  /* 1. Overdue homework */
  const overdue = sortTasks(filterTasks(tasks, "overdue", today), "priority", today);
  if (overdue.length > 0) {
    return {
      label: `${overdue.length} overdue task${overdue.length === 1 ? "" : "s"}`,
      detail: `${overdue[0].title} · ${overdue[0].subject}`,
      href: "/homework",
      subjectIcon: "physics",
      hasAction: true,
    };
  }

  /* 2. Homework due today */
  const todays = getTodaysTasks(tasks, today);
  if (todays.length > 0) {
    return {
      label: `${todays.length} task${todays.length === 1 ? "" : "s"} due today`,
      detail: `${todays[0].title} · ${todays[0].subject}`,
      href: "/homework",
      subjectIcon: "physics",
      hasAction: true,
    };
  }

  /* 3. First incomplete syllabus chapter */
  const syllabus = getSyllabus(board, stream);
  for (const subject of syllabus.subjects) {
    for (const chapter of subject.chapters) {
      const stats = calculateSubjectProgress(
        { subjectId: subject.subjectId, chapters: [chapter] },
        topicProgress,
      );
      if (stats.percent < 100) {
        const hint =
          stats.completed === 0
            ? "Not started"
            : `${stats.remaining} topic${stats.remaining === 1 ? "" : "s"} remaining`;
        return {
          label: `Continue ${SUBJECTS[subject.subjectId].name}`,
          detail: `${chapter.title} · ${hint}`,
          href: "/syllabus",
          subjectIcon: subject.subjectId,
          hasAction: true,
        };
      }
    }
  }

  /* 4. Incomplete practice */
  const practice = buildPracticeSummary(board, stream, questionProgress, scienceProgress);
  const incomplete = practice.subjects.find((s) => s.stats.percent < 100);
  if (incomplete) {
    return {
      label: `Practice ${incomplete.name.replace(" Numericals", "").replace(" Practice", "")}`,
      detail: `${incomplete.stats.completed} / ${incomplete.stats.total} questions`,
      href: incomplete.href,
      subjectIcon: incomplete.key === "mathematics" ? "mathematics" : incomplete.key === "physics" ? "physics" : "chemistry",
      hasAction: true,
    };
  }

  /* 5. All caught up */
  return {
    label: "You're all caught up!",
    detail: "Every topic practiced, every task done. Great work.",
    href: "/dashboard",
    hasAction: false,
  };
}
