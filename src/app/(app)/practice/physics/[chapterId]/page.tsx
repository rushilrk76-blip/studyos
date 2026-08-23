import type { Metadata } from "next";
import { ScienceChapterPractice } from "@/components/practice/science-chapter-practice";

export const metadata: Metadata = {
  title: "Physics Chapter Practice",
};

export default async function PhysicsChapterPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  return <ScienceChapterPractice subject="physics" chapterId={chapterId} />;
}
