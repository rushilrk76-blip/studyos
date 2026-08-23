import type { BoardId, StreamId } from "@/lib/student";
import { subjectsForStream } from "@/lib/subjects";
import { getSyllabus } from "@/data/syllabus";
import { getMathsPractice } from "@/data/practice";
import { getSciencePractice } from "@/data/practice/science";
import type { Task } from "@/lib/homework/types";
import type { ExamResult } from "@/lib/marks/types";
import type { Certificate, Project } from "@/lib/portfolio/types";

/*
  ────────────────────────────────────────────────
  Global search service — READ-ONLY.

  Builds an in-memory index from the student's syllabus,
  practice, homework, marks and portfolio data, then filters
  it by query + category + subject.

  Search NEVER modifies any data. Clicking a result only
  returns a navigation href.

  The index is built on demand and can be memoised by the
  caller. Static data (syllabus/practice definitions) comes
  from application data; user data (tasks/results/projects)
  comes from the service layer.
  ────────────────────────────────────────────────
*/

export type SearchCategory =
  | "syllabus"
  | "maths"
  | "physics"
  | "chemistry"
  | "homework"
  | "marks"
  | "portfolio";

export type SearchResult = {
  id: string;
  title: string;
  category: SearchCategory;
  subject: string;
  subtitle: string;
  href: string;
};

/** Internal index entry — lowercased text for fast matching. */
type IndexEntry = SearchResult & { searchText: string };

/* ── Category metadata ──────────────────────── */
export const CATEGORY_LABELS: Record<SearchCategory, string> = {
  syllabus: "Syllabus",
  maths: "Maths Practice",
  physics: "Physics Numericals",
  chemistry: "Chemistry Practice",
  homework: "Homework",
  marks: "Marks",
  portfolio: "Portfolio",
};

export const CATEGORY_ORDER: SearchCategory[] = [
  "syllabus",
  "homework",
  "marks",
  "maths",
  "physics",
  "chemistry",
  "portfolio",
];

/* ── Available filters per stream ───────────── */
export function getAvailableCategories(stream: StreamId): SearchCategory[] {
  const base: SearchCategory[] = ["syllabus", "physics", "chemistry", "homework", "marks", "portfolio"];
  if (subjectsForStream(stream).some((s) => s.id === "mathematics")) {
    base.splice(1, 0, "maths");
  }
  return base;
}

export function getAvailableSubjects(stream: StreamId): string[] {
  return [...subjectsForStream(stream).map((s) => s.name), "English", "Other"];
}

/* ── Build the search index ─────────────────── */
export type SearchIndexParams = {
  board: BoardId;
  stream: StreamId;
  tasks: Task[];
  results: ExamResult[];
  projects: Project[];
  certificates: Certificate[];
};

export function buildSearchIndex(params: SearchIndexParams): IndexEntry[] {
  const { board, stream, tasks, results, projects, certificates } = params;
  const entries: IndexEntry[] = [];

  /* A. Syllabus — chapters + topics */
  const syllabus = getSyllabus(board, stream);
  for (const subject of syllabus.subjects) {
    for (const chapter of subject.chapters) {
      entries.push({
        id: chapter.id,
        title: chapter.title,
        category: "syllabus",
        subject: subject.subjectId,
        subtitle: "Chapter",
        href: "/syllabus",
        searchText: `${chapter.title} ${subject.subjectId} chapter`.toLowerCase(),
      });
      for (const topic of chapter.topics) {
        entries.push({
          id: topic.id,
          title: topic.name,
          category: "syllabus",
          subject: subject.subjectId,
          subtitle: `${chapter.title}`,
          href: "/syllabus",
          searchText: `${topic.name} ${chapter.title} ${subject.subjectId}`.toLowerCase(),
        });
      }
    }
  }

  /* B. Maths practice — chapters + categories */
  if (subjectsForStream(stream).some((s) => s.id === "mathematics")) {
    const maths = getMathsPractice(board);
    for (const chapter of maths.chapters) {
      entries.push({
        id: chapter.chapterId,
        title: chapter.title,
        category: "maths",
        subject: "mathematics",
        subtitle: "Maths Practice",
        href: `/practice/maths/${chapter.chapterId}`,
        searchText: `${chapter.title} maths practice`.toLowerCase(),
      });
    }
  }

  /* C. Physics & Chemistry practice — chapters + categories */
  for (const subjectId of ["physics", "chemistry"] as const) {
    const practice = getSciencePractice(board, subjectId);
    for (const chapter of practice.chapters) {
      entries.push({
        id: chapter.chapterId,
        title: chapter.title,
        category: subjectId,
        subject: subjectId,
        subtitle: subjectId === "physics" ? "Physics Numericals" : "Chemistry Practice",
        href: `/practice/${subjectId}/${chapter.chapterId}`,
        searchText: `${chapter.title} ${subjectId} practice`.toLowerCase(),
      });
      for (const category of chapter.categories) {
        entries.push({
          id: category.id,
          title: category.name,
          category: subjectId,
          subject: subjectId,
          subtitle: `${chapter.title}`,
          href: `/practice/${subjectId}/${chapter.chapterId}`,
          searchText: `${category.name} ${chapter.title} ${subjectId}`.toLowerCase(),
        });
      }
    }
  }

  /* D. Homework tasks */
  for (const task of tasks) {
    entries.push({
      id: task.id,
      title: task.title,
      category: "homework",
      subject: task.subject,
      subtitle: `${task.type}`,
      href: "/homework",
      searchText: `${task.title} ${task.subject} ${task.type} ${task.notes}`.toLowerCase(),
    });
  }

  /* E. Exam results */
  for (const result of results) {
    entries.push({
      id: result.id,
      title: result.examName,
      category: "marks",
      subject: result.subject,
      subtitle: `${result.examType}`,
      href: "/marks",
      searchText: `${result.examName} ${result.subject} ${result.examType}`.toLowerCase(),
    });
  }

  /* F. Portfolio — projects + certificates */
  for (const project of projects) {
    entries.push({
      id: project.id,
      title: project.title,
      category: "portfolio",
      subject: project.subject || "General",
      subtitle: "Project",
      href: "/portfolio",
      searchText: `${project.title} ${project.subject} ${project.description} project`.toLowerCase(),
    });
  }
  for (const cert of certificates) {
    entries.push({
      id: cert.id,
      title: cert.title,
      category: "portfolio",
      subject: "General",
      subtitle: cert.organization || "Certificate",
      href: "/portfolio",
      searchText: `${cert.title} ${cert.organization} certificate`.toLowerCase(),
    });
  }

  return entries;
}

/* ── Search function ────────────────────────── */
export function searchStudyOS(
  index: IndexEntry[],
  query: string,
  options: {
    categories: SearchCategory[]; // empty = all
    subject: string; // "all" or a subject name
  },
): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const words = q.split(/\s+/).filter(Boolean);

  const matched = index.filter((entry) => {
    /* Category filter */
    if (options.categories.length > 0 && !options.categories.includes(entry.category)) {
      return false;
    }
    /* Subject filter */
    if (options.subject !== "all" && entry.subject !== options.subject) {
      return false;
    }
    /* Partial match — every word must appear somewhere in the search text */
    return words.every((word) => entry.searchText.includes(word));
  });

  /* Sort: title starts-with-query first, then alphabetical */
  const sorted = matched.sort((a, b) => {
    const aStarts = a.title.toLowerCase().startsWith(q) ? 0 : 1;
    const bStarts = b.title.toLowerCase().startsWith(q) ? 0 : 1;
    if (aStarts !== bStarts) return aStarts - bStarts;
    return a.title.localeCompare(b.title);
  });

  /* Limit per-category to keep results manageable */
  const limit = 8;
  const byCat = new Map<SearchCategory, number>();
  const result: SearchResult[] = [];

  for (const entry of sorted) {
    const count = byCat.get(entry.category) ?? 0;
    if (count >= limit) continue;
    byCat.set(entry.category, count + 1);
    result.push({
      id: entry.id,
      title: entry.title,
      category: entry.category,
      subject: entry.subject,
      subtitle: entry.subtitle,
      href: entry.href,
    });
  }

  return result;
}

/* ── Group results by category ──────────────── */
export function groupByCategory(
  results: SearchResult[],
): { category: SearchCategory; items: SearchResult[] }[] {
  const groups = new Map<SearchCategory, SearchResult[]>();
  for (const result of results) {
    const group = groups.get(result.category) ?? [];
    group.push(result);
    groups.set(result.category, group);
  }
  return CATEGORY_ORDER.filter((cat) => groups.has(cat)).map((category) => ({
    category,
    items: groups.get(category)!,
  }));
}
