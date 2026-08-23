import type {
  Chapter,
  ProgressStats,
  SubjectSyllabus,
  Syllabus,
  Topic,
  TopicProgress,
  TopicStatus,
} from "@/lib/syllabus/types";

/*
  ────────────────────────────────────────────────
  Every progress number in StudyOS is computed HERE.

  One small set of pure functions, reused everywhere —
  the syllabus page and the dashboard both call these,
  so a topic is always worth exactly the same percent
  no matter where it's displayed.
  ────────────────────────────────────────────────
*/

/** A single topic: completed, or not. */
export function calculateTopicProgress(
  topic: Topic,
  progress: TopicProgress,
): TopicStatus {
  return progress[topic.id] === "completed" ? "completed" : "not-started";
}

export function isTopicCompleted(
  topicId: string,
  progress: TopicProgress,
): boolean {
  return progress[topicId] === "completed";
}

/** Topic, chapter, subject, or whole syllabus — same shape of answer. */
function sumStats(topics: Topic[], progress: TopicProgress): ProgressStats {
  const total = topics.length;
  const completed = topics.reduce(
    (count, topic) =>
      count + (calculateTopicProgress(topic, progress) === "completed" ? 1 : 0),
    0,
  );
  return {
    total,
    completed,
    remaining: total - completed,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

function allTopics(chapters: Chapter[]): Topic[] {
  return chapters.flatMap((chapter) => chapter.topics);
}

export function calculateChapterProgress(
  chapter: Chapter,
  progress: TopicProgress,
): ProgressStats {
  return sumStats(chapter.topics, progress);
}

export function calculateSubjectProgress(
  subject: SubjectSyllabus,
  progress: TopicProgress,
): ProgressStats {
  return sumStats(allTopics(subject.chapters), progress);
}

export function calculateOverallProgress(
  syllabus: Syllabus,
  progress: TopicProgress,
): ProgressStats {
  return sumStats(
    syllabus.subjects.flatMap((subject) => allTopics(subject.chapters)),
    progress,
  );
}

/*
  Returns a NEW progress record with one topic flipped.
  (Immutability keeps React renders predictable; completed
  topics are the only ones ever written.)
*/
export function withTopicToggled(
  progress: TopicProgress,
  topicId: string,
): TopicProgress {
  const next = { ...progress };
  if (next[topicId] === "completed") {
    delete next[topicId];
  } else {
    next[topicId] = "completed";
  }
  return next;
}
