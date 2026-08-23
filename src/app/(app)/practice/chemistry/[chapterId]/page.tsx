import type { Metadata } from "next";
import { ScienceChapterPractice } from "@/components/practice/science-chapter-practice";

export const metadata: Metadata = {
  title: "Chemistry Chapter Practice",
};

export default async function ChemistryChapterPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  return <ScienceChapterPractice subject="chemistry" chapterId={chapterId} />;
}
