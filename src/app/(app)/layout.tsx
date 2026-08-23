import type { ReactNode } from "react";
import { AppShell } from "@/components/app/app-shell";

/*
  The (app) route group: every page inside it (/dashboard,
  /syllabus, …) is wrapped by the AppShell — sidebar, header,
  bottom tabs, and the profile guard — without the group
  appearing in the URL.
*/
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
