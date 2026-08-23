import {
  Atom,
  Dna,
  FlaskConical,
  Sigma,
  type LucideIcon,
} from "lucide-react";
import type { StreamId } from "@/lib/student";

/*
  ────────────────────────────────────────────────
  The subject catalog.

  A Subject is a stable UI concept (name + icon + colours).
  Which subjects a student has comes from their stream —
  one mapping table, no duplication.

  Later, the syllabus tables will attach chapters/topics
  to these same subject ids, and progress will be computed
  per subject. Nothing here needs to change for that.
  ────────────────────────────────────────────────
*/

export type SubjectId = "physics" | "chemistry" | "mathematics" | "biology";

export type Subject = {
  id: SubjectId;
  name: string;
  icon: LucideIcon;
  /** Tailwind classes for the icon tile and progress bar. */
  accent: {
    tile: string;
    bar: string;
  };
};

export const SUBJECTS: Record<SubjectId, Subject> = {
  physics: {
    id: "physics",
    name: "Physics",
    icon: Atom,
    accent: { tile: "bg-sky-500/10 text-sky-600", bar: "bg-sky-500" },
  },
  chemistry: {
    id: "chemistry",
    name: "Chemistry",
    icon: FlaskConical,
    accent: { tile: "bg-violet-500/10 text-violet-600", bar: "bg-violet-500" },
  },
  mathematics: {
    id: "mathematics",
    name: "Mathematics",
    icon: Sigma,
    accent: { tile: "bg-indigo-500/10 text-indigo-600", bar: "bg-indigo-500" },
  },
  biology: {
    id: "biology",
    name: "Biology",
    icon: Dna,
    accent: { tile: "bg-pine-600/10 text-pine-600", bar: "bg-pine-600" },
  },
};

const STREAM_SUBJECTS: Record<StreamId, SubjectId[]> = {
  pcm: ["physics", "chemistry", "mathematics"],
  pcb: ["physics", "chemistry", "biology"],
  pcmb: ["physics", "chemistry", "mathematics", "biology"],
};

/** The subjects a student studies, based on their chosen stream. */
export function subjectsForStream(stream: StreamId): Subject[] {
  return STREAM_SUBJECTS[stream].map((id) => SUBJECTS[id]);
}

/** Does this stream include a given subject? */
export function streamHasSubject(
  stream: StreamId,
  subject: SubjectId,
): boolean {
  return STREAM_SUBJECTS[stream].includes(subject);
}

/**
 * Maths Practice is only for students who actually study Maths:
 * PCM ✓, PCMB ✓, PCB ✗.
 */
export function streamHasMaths(stream: StreamId): boolean {
  return streamHasSubject(stream, "mathematics");
}
