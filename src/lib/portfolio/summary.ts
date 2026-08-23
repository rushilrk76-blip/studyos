import type { StudentProfile } from "@/lib/student";
import { SUBJECTS, subjectsForStream } from "@/lib/subjects";
import { getSyllabus } from "@/data/syllabus";
import { calculateOverallProgress, calculateSubjectProgress } from "@/lib/syllabus/progress";
import type { TopicProgress } from "@/lib/syllabus/types";
import { getMathsPractice } from "@/data/practice";
import { calculateOverallPractice } from "@/lib/practice/progress";
import { getSciencePractice } from "@/data/practice/science";
import { calculateSubjectPracticeProgress } from "@/lib/practice/concept-progress";
import type { ConceptProgress } from "@/lib/practice/concept-types";
import type { QuestionProgress } from "@/lib/practice/types";
import { calculateTaskStats } from "@/lib/homework/tasks";
import type { Task } from "@/lib/homework/types";
import { calculateStats, calculateSubjectStats, sortByNewest } from "@/lib/marks/results";
import type { ExamResult } from "@/lib/marks/types";
import type { Certificate, Project } from "@/lib/portfolio/types";

/*
  ────────────────────────────────────────────────
  The Portfolio is a VIEW of the student's real data.

  buildPortfolioSummary() collects every data source and
  derives every statistic. Nothing is stored as a duplicate.
  If the student edits a test result, the portfolio's average
  recalculates automatically — because it reads from the same
  marks data, not a cached copy.

  The only NEW data are the manually-added Projects & Certificates,
  which are passed in from their own storage.
  ────────────────────────────────────────────────
*/

export type SubjectPortfolioEntry = {
  subjectId: string;
  name: string;
  icon: typeof SUBJECTS.physics.icon;
  accent: { tile: string; bar: string };
  syllabusPercent: number;
  syllabusStats: {
    completed: number;
    total: number;
  };
};

export type PracticeEntry = {
  name: string;
  completed: number;
  total: number;
  percent: number;
};

export type PortfolioSummary = {
  profile: StudentProfile;
  studentId: string;

  syllabusOverall: {
    percent: number;
    completed: number;
    remaining: number;
    total: number;
  };
  subjects: SubjectPortfolioEntry[];

  practice: PracticeEntry[];

  homework: {
    total: number;
    completed: number;
    pending: number;
    percent: number;
  };

  marks: {
    hasResults: boolean;
    tests: number;
    averagePercent: number;
    bestPercent: number;
    latest: ExamResult | null;
    bySubject: ReturnType<typeof calculateSubjectStats>;
  };

  achievements: ReturnType<typeof deriveAchievements>;
  completion: {
    percent: number;
    factors: { label: string; met: boolean }[];
  };

  projects: Project[];
  certificates: Certificate[];
};

export function buildPortfolioSummary(params: {
  profile: StudentProfile;
  topicProgress: TopicProgress;
  questionProgress: QuestionProgress;
  scienceProgress: ConceptProgress;
  tasks: Task[];
  results: ExamResult[];
  projects: Project[];
  certificates: Certificate[];
}): PortfolioSummary {
  const {
    profile,
    topicProgress,
    questionProgress,
    scienceProgress,
    tasks,
    results,
    projects,
    certificates,
  } = params;

  /* ── Syllabus ── */
  const syllabus = getSyllabus(profile.board, profile.stream);
  const overall = calculateOverallProgress(syllabus, topicProgress);
  const streamSubjects = subjectsForStream(profile.stream);

  const subjects: SubjectPortfolioEntry[] = syllabus.subjects.map((ss) => {
    const subject = SUBJECTS[ss.subjectId];
    const stats = calculateSubjectProgress(ss, topicProgress);
    return {
      subjectId: ss.subjectId,
      name: subject.name,
      icon: subject.icon,
      accent: subject.accent,
      syllabusPercent: stats.percent,
      syllabusStats: { completed: stats.completed, total: stats.total },
    };
  });

  /* ── Practice ── */
  const practice: PracticeEntry[] = [];

  // Maths (PCM, PCMB only)
  const hasMaths = streamSubjects.some((s) => s.id === "mathematics");
  if (hasMaths) {
    const mathsStats = calculateOverallPractice(
      getMathsPractice(profile.board),
      questionProgress,
    );
    practice.push({
      name: "Maths Practice",
      completed: mathsStats.completed,
      total: mathsStats.total,
      percent: mathsStats.percent,
    });
  }

  // Physics & Chemistry (all streams)
  for (const subjectId of ["physics", "chemistry"] as const) {
    const stats = calculateSubjectPracticeProgress(
      getSciencePractice(profile.board, subjectId),
      scienceProgress,
    );
    practice.push({
      name:
        subjectId === "physics"
          ? "Physics Numericals"
          : "Chemistry Practice",
      completed: stats.completed,
      total: stats.total,
      percent: stats.percent,
    });
  }

  /* ── Homework ── */
  const hwStats = calculateTaskStats(tasks);
  const homeworkPercent =
    hwStats.total === 0
      ? 0
      : Math.round((hwStats.completed / hwStats.total) * 100);

  /* ── Marks ── */
  const marksStats = calculateStats(results);
  const marksBySubject = calculateSubjectStats(results);

  /* ── Achievements ── */
  const totalPracticeDone = practice.reduce((sum, p) => sum + p.completed, 0);
  const achievements = deriveAchievements({
    topicsCompleted: overall.completed,
    testsRecorded: results.length,
    questionsPracticed: totalPracticeDone,
    homeworkCompleted: hwStats.completed,
  });

  /* ── Portfolio completion ── */
  const completionFactors = [
    { label: "Profile set up", met: profile.name.trim().length > 0 },
    { label: "Syllabus activity", met: overall.completed > 0 },
    { label: "Practice activity", met: totalPracticeDone > 0 },
    { label: "Test results recorded", met: results.length > 0 },
    { label: "Homework added", met: hwStats.total > 0 },
    { label: "Projects added", met: projects.length > 0 },
    { label: "Certificates added", met: certificates.length > 0 },
  ];
  const metCount = completionFactors.filter((f) => f.met).length;
  const completionPercent = Math.round(
    (metCount / completionFactors.length) * 100,
  );

  return {
    profile,
    studentId: profile.studentId,
    syllabusOverall: {
      percent: overall.percent,
      completed: overall.completed,
      remaining: overall.remaining,
      total: overall.total,
    },
    subjects,
    practice,
    homework: {
      total: hwStats.total,
      completed: hwStats.completed,
      pending: hwStats.pending,
      percent: homeworkPercent,
    },
    marks: {
      hasResults: results.length > 0,
      tests: marksStats.tests,
      averagePercent: marksStats.averagePercent,
      bestPercent: marksStats.bestPercent,
      latest: sortByNewest(results)[0] ?? null,
      bySubject: marksBySubject,
    },
    achievements,
    completion: { percent: completionPercent, factors: completionFactors },
    projects: [...projects].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    certificates: [...certificates].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    ),
  };
}

/* ── Achievement rules ──────────────────────── */
export type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
};

export function deriveAchievements(metrics: {
  topicsCompleted: number;
  testsRecorded: number;
  questionsPracticed: number;
  homeworkCompleted: number;
}) {
  const rules = [
    {
      id: "first-topic" as const,
      title: "First Step",
      description: "Completed your first syllabus topic.",
      unlocked: metrics.topicsCompleted >= 1,
    },
    {
      id: "ten-topics" as const,
      title: "10 Topics Completed",
      description: "Completed at least 10 syllabus topics.",
      unlocked: metrics.topicsCompleted >= 10,
    },
    {
      id: "fifty-topics" as const,
      title: "50 Topics Completed",
      description: "Completed at least 50 syllabus topics.",
      unlocked: metrics.topicsCompleted >= 50,
    },
    {
      id: "first-test" as const,
      title: "First Test Recorded",
      description: "Added your first exam result.",
      unlocked: metrics.testsRecorded >= 1,
    },
    {
      id: "ten-tests" as const,
      title: "10 Tests Recorded",
      description: "Recorded 10 test results.",
      unlocked: metrics.testsRecorded >= 10,
    },
    {
      id: "fifty-questions" as const,
      title: "50 Questions Practiced",
      description: "Completed 50 practice questions.",
      unlocked: metrics.questionsPracticed >= 50,
    },
    {
      id: "hundred-questions" as const,
      title: "100 Questions Practiced",
      description: "Completed 100 practice questions.",
      unlocked: metrics.questionsPracticed >= 100,
    },
    {
      id: "first-homework" as const,
      title: "Homework Starter",
      description: "Completed your first homework task.",
      unlocked: metrics.homeworkCompleted >= 1,
    },
  ];

  return rules;
}
