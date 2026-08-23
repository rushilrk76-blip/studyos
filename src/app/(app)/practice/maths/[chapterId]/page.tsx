import type { Metadata } from "next";
import { ChapterPractice } from "@/components/practice/chapter-practice";

export const metadata: Metadata = {
  title: "Chapter Practice",
};

/*
  The chapter id comes from the URL (it's the same id as the
  syllabus chapter, e.g. "cbse-mathematics-ch3"). The component
  resolves it against the student's own board.
*/
export default async function ChapterPracticePage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  return <ChapterPractice chapterId={chapterId} />;
}
