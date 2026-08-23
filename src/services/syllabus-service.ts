import {
  loadTopicProgress,
  saveTopicProgress,
  clearTopicProgress,
} from "@/lib/syllabus-storage";
import {
  withTopicToggled,
} from "@/lib/syllabus/progress";
import type { TopicProgress } from "@/lib/syllabus/types";

/*
  ────────────────────────────────────────────────
  Syllabus progress service.

  Stores ONLY completed topic IDs — the full chapter/topic
  definitions stay in static application data
  (src/data/syllabus) and are never duplicated to storage.

  FUTURE: methods become async when backed by Supabase
  (a `topic_completions` table keyed by topicId).
  ────────────────────────────────────────────────
*/

export const syllabusService = {
  /** Returns the topic completion record (topicId → "completed"). */
  getProgress(): TopicProgress {
    return loadTopicProgress();
  },

  saveProgress(progress: TopicProgress): void {
    saveTopicProgress(progress);
  },

  /** Returns a NEW record with one topic flipped — never mutates. */
  toggleTopic(progress: TopicProgress, topicId: string): TopicProgress {
    return withTopicToggled(progress, topicId);
  },

  clearProgress(): void {
    clearTopicProgress();
  },
};
