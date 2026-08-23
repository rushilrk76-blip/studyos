import type { Metadata } from "next";
import { HomeworkView } from "@/components/homework/homework-view";

export const metadata: Metadata = {
  title: "Homework",
  description:
    "Keep track of everything you need to study, complete, or submit.",
};

export default function HomeworkPage() {
  return <HomeworkView />;
}
