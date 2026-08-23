import type { Metadata } from "next";
import { PracticeOverview } from "@/components/practice/practice-overview";

export const metadata: Metadata = {
  title: "Practice",
  description:
    "Track the Maths, Physics and Chemistry questions you've practiced, chapter by chapter.",
};

export default function PracticePage() {
  return <PracticeOverview />;
}
