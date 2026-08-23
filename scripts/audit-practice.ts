/*
  Development audit for the Maths question-practice structure.

  Run:  npx tsx scripts/audit-practice.ts

  Verifies, for every board:
  - every Mathematics chapter in the SYLLABUS has a practice structure
  - each chapter has exactly 5 sets
  - each set has exactly 10 questions
  - 50 questions per chapter, all IDs unique

  Any syllabus chapter missing from practice is REPORTED, never ignored.
*/
import { SYLLABUS_REGISTRY } from "../src/data/syllabus";
import { getMathsPractice } from "../src/data/practice";
import {
  QUESTIONS_PER_CHAPTER,
  QUESTIONS_PER_SET,
  SETS_PER_CHAPTER,
} from "../src/lib/practice/types";

const BOARDS = ["cbse", "rbse"] as const;

let failures = 0;
const allIds: string[] = [];

for (const board of BOARDS) {
  const syllabusChapters = SYLLABUS_REGISTRY[board].mathematics.chapters;
  const practice = getMathsPractice(board);

  console.log(`\n===== ${board.toUpperCase()} MATHEMATICS =====`);
  console.log(
    `${"Chapter".padEnd(38)} ${"Sets".padStart(4)} ${"Q/Set".padStart(6)} ${"Total".padStart(6)}`,
  );

  for (const chapter of practice.chapters) {
    const perSet = chapter.sets.map((s) => s.questions.length);
    const total = perSet.reduce((a, b) => a + b, 0);
    const uniformPerSet = new Set(perSet).size === 1 ? perSet[0] : NaN;

    const ok =
      chapter.sets.length === SETS_PER_CHAPTER &&
      uniformPerSet === QUESTIONS_PER_SET &&
      total === QUESTIONS_PER_CHAPTER;
    if (!ok) failures++;

    chapter.sets.forEach((s) => allIds.push(...s.questions.map((q) => q.id)));

    console.log(
      `${(ok ? "✓ " : "✗ ") + chapter.title.slice(0, 36).padEnd(36)} ` +
        `${String(chapter.sets.length).padStart(4)} ${String(uniformPerSet).padStart(6)} ${String(total).padStart(6)}`,
    );
  }

  /* Any Maths chapter in the syllabus with no practice structure? */
  const practiceIds = new Set(practice.chapters.map((c) => c.chapterId));
  const missing = syllabusChapters.filter((c) => !practiceIds.has(c.id));
  if (missing.length > 0) {
    failures += missing.length;
    console.log(`\n  !! MISSING PRACTICE FOR ${missing.length} CHAPTER(S):`);
    missing.forEach((c) => console.log(`     - ${c.id} (${c.title})`));
  } else {
    console.log(
      `\n  All ${syllabusChapters.length} syllabus chapters have practice structures.`,
    );
  }

  const chapterTotal = practice.chapters.length * QUESTIONS_PER_CHAPTER;
  console.log(
    `  TOTAL: ${practice.chapters.length} chapters × ${SETS_PER_CHAPTER} sets × ${QUESTIONS_PER_SET} questions = ${chapterTotal} questions`,
  );
}

const unique = new Set(allIds);
console.log(`\n===== ID CHECK =====`);
console.log(`Question IDs: ${allIds.length} | unique: ${unique.size}`);
if (allIds.length !== unique.size) {
  failures++;
  console.log("!! DUPLICATE QUESTION IDS FOUND");
}
console.log(`Sample: ${allIds[0]} … ${allIds[allIds.length - 1]}`);

console.log(
  failures === 0
    ? "\n✅ AUDIT PASSED — structure is complete and consistent.\n"
    : `\n❌ AUDIT FAILED — ${failures} problem(s) found.\n`,
);

process.exit(failures === 0 ? 0 : 1);
