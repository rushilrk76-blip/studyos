import type { BoardId, StreamId } from "@/lib/student";
import { subjectsForStream, type SubjectId } from "@/lib/subjects";
import type { SubjectSyllabus, Syllabus } from "@/lib/syllabus/types";

import { cbsePhysics } from "@/data/syllabus/cbse/physics";
import { cbseChemistry } from "@/data/syllabus/cbse/chemistry";
import { cbseMathematics } from "@/data/syllabus/cbse/mathematics";
import { cbseBiology } from "@/data/syllabus/cbse/biology";

import { rbsePhysics } from "@/data/syllabus/rbse/physics";
import { rbseChemistry } from "@/data/syllabus/rbse/chemistry";
import { rbseMathematics } from "@/data/syllabus/rbse/mathematics";
import { rbseBiology } from "@/data/syllabus/rbse/biology";

/*
  ────────────────────────────────────────────────
  The syllabus registry.

  CBSE and RBSE are completely separate datasets — nothing is
  shared or copied between them. A stream simply selects which
  of a board's subjects a student sees.

  Everything is static application data (no network, no database):
  the modules are imported once and reused, so switching subjects
  or filtering never re-reads or re-builds anything.
  ────────────────────────────────────────────────
*/

const REGISTRY: Record<BoardId, Record<SubjectId, SubjectSyllabus>> = {
  cbse: {
    physics: cbsePhysics,
    chemistry: cbseChemistry,
    mathematics: cbseMathematics,
    biology: cbseBiology,
  },
  rbse: {
    physics: rbsePhysics,
    chemistry: rbseChemistry,
    mathematics: rbseMathematics,
    biology: rbseBiology,
  },
};

/*
  Built syllabi are cached per board+stream. buildDashboard() and the
  syllabus page both call this on every render, so the cache keeps
  the app fast no matter how large the dataset grows.
*/
const cache = new Map<string, Syllabus>();

export function getSyllabus(board: BoardId, stream: StreamId): Syllabus {
  const key = `${board}:${stream}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const syllabus: Syllabus = {
    board,
    stream,
    subjects: subjectsForStream(stream).map(
      (subject) => REGISTRY[board][subject.id],
    ),
  };
  cache.set(key, syllabus);
  return syllabus;
}

/** Used by the completeness audit script. */
export const SYLLABUS_REGISTRY = REGISTRY;
