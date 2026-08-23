import { getBoard, getStream, type StudentProfile } from "@/lib/student";
import { SUBJECTS, type Subject } from "@/lib/subjects";
import { getSyllabus } from "@/data/syllabus";
import {
  calculateOverallProgress,
  calculateSubjectProgress,
} from "@/lib/syllabus/progress";
import type {
  ProgressStats,
  TopicProgress,
} from "@/lib/syllabus/types";
import type { QuestionProgress } from "@/lib/practice/types";
import type { ConceptProgress, ConceptStats } from "@/lib/practice/concept-types";
import {
  buildPracticeSummary,
  type PracticeSummary,
} from "@/lib/practice/summary";
import {
  calculateTaskStats,
  filterTasks,
  formatDueDate,
  getTodaysTasks,
  sortTasks,
  todayKey,
} from "@/lib/homework/tasks";
import type { Task, TaskStats } from "@/lib/homework/types";
import { buildMarksSummary, type MarksSummary } from "@/lib/marks/summary";
import {
  calcPercentage,
  calculateStats,
  sortByNewest,
  toChartData,
  type ChartPoint,
} from "@/lib/marks/results";
import type { ExamResult } from "@/lib/marks/types";
import { deriveAchievements, type Achievement } from "@/lib/portfolio/summary";

/*
  ────────────────────────────────────────────────
  Dashboard 2.0 view-model.

  buildDashboard() turns every data source the student has
  into a single, comprehensive command-center model. Every
  number is computed from the real source data — no duplicates,
  no hardcoded statistics.

  The dashboard is a VIEW, not a store.
  ────────────────────────────────────────────────
*/

export interface DashboardStats {
  syllabusPercent: number;
  topicsCompleted: number;
  topicsRemaining: number;
  topicsTotal: number;
  homework: TaskStats;
}

/** A subject plus its live syllabus + practice stats. */
export interface SubjectEntry {
  subject: Subject;
  syllabusStats: ProgressStats;
  /** Practice stats for this subject (undefined for Biology). */
  practiceStats?: ConceptStats;
  /** Link to the subject's practice page. */
  practiceHref?: string;
}

/** A "What should I study next?" suggestion. */
export type StudySuggestion = {
  subjectName: string;
  chapterTitle: string;
  /** Short hint about what needs doing. */
  hint: string;
  href: string;
};

export interface DashboardData {
  firstName: string;
  greeting: string;
  boardName: string;
  streamName: string;
  dateString: string;
  studentId: string;
  subjects: SubjectEntry[];
  stats: DashboardStats;
  practice: PracticeSummary;
  todaysTasks: Task[];
  overdueTasks: Task[];
  upcomingTasks: Task[];
  marks: MarksSummary;
  portfolioPercent: number;
  chartPoints: ChartPoint[];
  studySuggestions: StudySuggestion[];
  achievements: Achievement[];
}

/** Time-based greeting, e.g. "Good evening". */
export function getGreeting(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function buildDashboard(
  profile: StudentProfile,
  now: Date,
  topicProgress: TopicProgress,
  questionProgress: QuestionProgress = {},
  tasks: Task[] = [],
  sciencePractice: ConceptProgress = {},
  results: ExamResult[] = [],
): DashboardData {
  const syllabus = getSyllabus(profile.board, profile.stream);
  const overall = calculateOverallProgress(syllabus, topicProgress);
  const today = todayKey(now);

  const practice = buildPracticeSummary(
    profile.board,
    profile.stream,
    questionProgress,
    sciencePractice,
  );

  const homework = calculateTaskStats(tasks, today);

  const marks = buildMarksSummary(results);

  const portfolioFactors = [
    profile.name.trim().length > 0,
    overall.completed > 0,
    practice.overall.completed > 0,
    results.length > 0,
    homework.total > 0,
  ];
  const portfolioPercent = Math.round(
    (portfolioFactors.filter(Boolean).length / portfolioFactors.length) * 100,
  );

  /* ── Subjects: syllabus + practice combined ── */
  // Build a lookup of practice stats by subjectId
  const practiceBySubject = new Map<string, ConceptStats>(
    practice.subjects.map((s) => [s.key, s.stats]),
  );
  const subjects: SubjectEntry[] = syllabus.subjects.map((ss) => {
    const subject = SUBJECTS[ss.subjectId];
    const syllabusStats = calculateSubjectProgress(ss, topicProgress);
    const entry: SubjectEntry = { subject, syllabusStats };

    // Attach practice stats where they exist
    const pStats = practiceBySubject.get(ss.subjectId);
    if (pStats) {
      entry.practiceStats = pStats;
      const practiceKey =
        ss.subjectId === "mathematics" ? "maths" : ss.subjectId;
      entry.practiceHref = `/practice/${practiceKey}`;
    }
    return entry;
  });

  /* ── Tasks: today / overdue / upcoming ── */
  const todaysTasks = getTodaysTasks(tasks, today);
  const overdueTasks = sortTasks(
    filterTasks(tasks, "overdue", today),
    "priority",
    today,
  ).slice(0, 5);
  const upcomingTasks = sortTasks(
    filterTasks(tasks, "upcoming", today),
    "due-date",
    today,
  ).slice(0, 4);

  /* ── Chart points for marks trend ── */
  const chartPoints = toChartData(results).slice(-8); // last 8 results

  /* ── Study suggestions ── */
  const studySuggestions = buildStudySuggestions(
    syllabus,
    topicProgress,
    practice.subjects,
    profile.board,
  );

  /* ── Achievements ── */
  const achievements = deriveAchievements({
    topicsCompleted: overall.completed,
    testsRecorded: results.length,
    questionsPracticed: practice.overall.completed,
    homeworkCompleted: homework.completed,
  });

  return {
    practice,
    marks,
    portfolioPercent,
    todaysTasks,
    overdueTasks,
    upcomingTasks,
    chartPoints,
    studySuggestions,
    achievements,
    studentId: profile.studentId,
    firstName: profile.name.trim().split(/\s+/)[0],
    greeting: getGreeting(now),
    boardName: getBoard(profile.board).name,
    streamName: getStream(profile.stream).name,
    dateString: new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(now),
    subjects,
    stats: {
      syllabusPercent: overall.percent,
      topicsCompleted: overall.completed,
      topicsRemaining: overall.remaining,
      topicsTotal: overall.total,
      homework,
    },
  };
}

/*
  ── "What Should I Study Next?" engine ──
  Finds the first incomplete chapter per subject and describes
  what needs doing. Deterministic, not random.
*/
function buildStudySuggestions(
  syllabus: ReturnType<typeof getSyllabus>,
  topicProgress: TopicProgress,
  practiceSubjects: PracticeSummary["subjects"],
  board: StudentProfile["board"],
): StudySuggestion[] {
  const suggestions: StudySuggestion[] = [];
  const practiceMap = new Map<string, (typeof practiceSubjects)[number]>(
    practiceSubjects.map((s) => [s.key, s]),
  );

  for (const ss of syllabus.subjects) {
    if (suggestions.length >= 4) break;

    // Find the first chapter that isn't 100% complete
    const nextChapter = ss.chapters.find((chapter) => {
      const stats = calculateSubjectProgress(
        { subjectId: ss.subjectId, chapters: [chapter] },
        topicProgress,
      );
      return stats.percent < 100;
    });

    if (!nextChapter) continue;

    const chapterStats = calculateSubjectProgress(
      { subjectId: ss.subjectId, chapters: [nextChapter] },
      topicProgress,
    );

    let hint: string;
    let href: string;

    if (chapterStats.completed === 0) {
      hint = "Not started";
    } else {
      hint = `${chapterStats.remaining} topic${chapterStats.remaining === 1 ? "" : "s"} remaining`;
    }

    // Check if practice is available for this subject
    const practiceEntry = practiceMap.get(ss.subjectId);
    if (practiceEntry && practiceEntry.stats.percent < 100) {
      hint += ` · Practice: ${practiceEntry.stats.completed}/${practiceEntry.stats.total}`;
      const practiceKey =
        ss.subjectId === "mathematics" ? "maths" : ss.subjectId;
      href = `/practice/${practiceKey}`;
    } else {
      href = "/syllabus";
    }

    suggestions.push({
      subjectName: SUBJECTS[ss.subjectId].name,
      chapterTitle: nextChapter.title,
      hint,
      href,
    });
  }

  return suggestions;
}

/* Re-export for the dashboard's interactive components */
export {
  calculateStats as calculateMarksStats,
  sortByNewest,
  calcPercentage,
  formatDueDate,
};
