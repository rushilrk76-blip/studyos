import type { Metadata } from "next";
import { PracticeHub } from "@/components/practice/practice-hub";

export const metadata: Metadata = {
  title: "Maths Practice",
  description:
    "Track how many Class 12 Mathematics questions you've practiced, chapter by chapter.",
};

export default function PracticePage() {
  return <PracticeHub />;
}
