import type { Metadata } from "next";
import { SyllabusView } from "@/components/syllabus/syllabus-view";

export const metadata: Metadata = {
  title: "Syllabus",
  description:
    "Track every Class 12 topic and know exactly what is completed and what is remaining.",
};

export default function SyllabusPage() {
  return <SyllabusView />;
}
