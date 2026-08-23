/*
  Development audit for Physics & Chemistry practice.

  Run:  npx tsx scripts/audit-science-practice.ts

  Reports per board and subject:
  - every chapter, its practice mode, category count and slot total
  - which chapters are numerical-heavy vs concept-based
  - any syllabus chapter missing a practice structure
  - any category totals that don't add up to 30
  - duplicate ids

  Fails loudly rather than pretending the system is complete.
*/
import {
  SCIENCE_PRACTICE_REGISTRY,
  PRACTICE_DATA_ISSUES,
  type SciencePracticeSubject,
} from "../src/data/practice/science";
import { SYLLABUS_REGISTRY } from "../src/data/syllabus";
import { QUESTIONS_PER_SCIENCE_CHAPTER } from "../src/lib/practice/concept-types";

const BOARDS = ["cbse", "rbse"] as const;
const SUBJECTS: SciencePracticeSubject[] = ["physics", "chemistry"];

let failures = 0;
const allIds: string[] = [];
const modeTally: Record<string, string[]> = {
  numerical: [],
  mixed: [],
  concept: [],
};

for (const board of BOARDS) {
  for (const subject of SUBJECTS) {
    const practice = SCIENCE_PRACTICE_REGISTRY[board][subject];
    const syllabusChapters = SYLLABUS_REGISTRY[board][subject].chapters;

    console.log(`\n===== ${board.toUpperCase()} ${subject.toUpperCase()} =====`);
    console.log(
      `${"Chapter".padEnd(46)} ${"Mode".padEnd(10)} ${"Cats".padStart(4)} ${"Slots".padStart(6)}`,
    );

    let subjectSlots = 0;
    let subjectCategories = 0;

    for (const chapter of practice.chapters) {
      const slots = chapter.categories.reduce(
        (sum, c) => sum + c.questions.length,
        0,
      );
      subjectSlots += slots;
      subjectCategories += chapter.categories.length;
      modeTally[chapter.mode].push(
        `${board}/${subject}: ${chapter.title}`,
      );

      chapter.categories.forEach((c) =>
        allIds.push(...c.questions.map((q) => q.id)),
      );

      const ok = slots === QUESTIONS_PER_SCIENCE_CHAPTER;
      if (!ok) failures++;

      console.log(
        `${(ok ? "✓ " : "✗ ") + chapter.title.slice(0, 44).padEnd(44)} ` +
          `${chapter.mode.padEnd(10)} ${String(chapter.categories.length).padStart(4)} ${String(slots).padStart(6)}`,
      );
    }

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
    console.log(
      `  TOTALS: ${practice.chapters.length} chapters · ${subjectCategories} concept categories · ${subjectSlots} question slots`,
    );
  }
}

console.log(`\n===== MODE BREAKDOWN =====`);
for (const mode of ["numerical", "mixed", "concept"] as const) {
  console.log(`\n${mode.toUpperCase()} (${modeTally[mode].length} chapters)`);
  const chem = modeTally[mode].filter((m) => m.includes("chemistry"));
  const phy = modeTally[mode].filter((m) => m.includes("physics"));
  console.log(`  physics: ${phy.length}   chemistry: ${chem.length}`);
  if (mode !== "numerical") {
    chem.slice(0, 20).forEach((c) => console.log(`   · ${c}`));
  }
}

console.log(`\n===== ID CHECK =====`);
const unique = new Set(allIds);
console.log(`Question IDs: ${allIds.length} | unique: ${unique.size}`);
if (allIds.length !== unique.size) {
  failures++;
  console.log("!! DUPLICATE QUESTION IDS FOUND");
}
console.log(`Sample: ${allIds[0]}`);

if (PRACTICE_DATA_ISSUES.length > 0) {
  failures += PRACTICE_DATA_ISSUES.length;
  console.log(`\n===== DATA ISSUES =====`);
  PRACTICE_DATA_ISSUES.forEach((issue) => console.log(`  !! ${issue}`));
}

console.log(
  failures === 0
    ? "\n✅ AUDIT PASSED — every chapter has its full practice structure.\n"
    : `\n❌ AUDIT FAILED — ${failures} problem(s) found.\n`,
);

process.exit(failures === 0 ? 0 : 1);
