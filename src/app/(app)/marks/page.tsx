import type { Metadata } from "next";
import { MarksView } from "@/components/marks/marks-view";

export const metadata: Metadata = {
  title: "Marks",
  description: "Track your test scores and understand your academic progress.",
};

export default function MarksPage() {
  return <MarksView />;
}
