import type { Metadata } from "next";
import { ScienceHub } from "@/components/practice/science-hub";

export const metadata: Metadata = {
  title: "Chemistry Practice",
  description:
    "30 practice questions per Class 12 Chemistry chapter, grouped by formula or concept.",
};

export default function ChemistryPracticePage() {
  return <ScienceHub subject="chemistry" />;
}
