import type { Metadata } from "next";
import { ScienceHub } from "@/components/practice/science-hub";

export const metadata: Metadata = {
  title: "Physics Numericals",
  description:
    "30 numericals per Class 12 Physics chapter, grouped by concept and formula.",
};

export default function PhysicsPracticePage() {
  return <ScienceHub subject="physics" />;
}
