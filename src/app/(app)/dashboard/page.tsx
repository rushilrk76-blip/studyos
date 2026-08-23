import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Class 12 command center — syllabus, homework, marks, and portfolio at a glance.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
