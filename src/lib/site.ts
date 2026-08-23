import {
  Award,
  ListChecks,
  NotebookPen,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

/*
  ────────────────────────────────────────────────
  All landing-page content lives here, in plain data.
  Why: components stay clean, and editing text later
  means changing this one file — not hunting through JSX.
  ────────────────────────────────────────────────
*/

export const site = {
  name: "StudyOS",
  tagline: "Your Class 12 Journey, Organized.",
  description:
    "Track your syllabus, manage homework, record your marks, and build your academic portfolio — all in one place.",
} as const;

/*
  All internal routes live here. When a page moves (e.g. real auth
  replaces the onboarding-as-login stand-in), we change one line.
*/
export const routes = {
  home: "/",
  features: "/#features",
  howItWorks: "/#how-it-works",
  getStarted: "/get-started",
  dashboard: "/dashboard",
  login: "/get-started", // → replace with "/login" when auth ships
} as const;

export const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
] as const;

export type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const features: Feature[] = [
  {
    title: "Syllabus Tracker",
    description:
      "Track every topic and know exactly how much of your syllabus is completed.",
    icon: ListChecks,
  },
  {
    title: "Homework",
    description: "Keep all your assignments and study tasks organized.",
    icon: NotebookPen,
  },
  {
    title: "Marks & Progress",
    description:
      "Record your test scores and understand your academic progress.",
    icon: TrendingUp,
  },
  {
    title: "Academic Portfolio",
    description: "Build a complete academic profile from the work you do.",
    icon: Award,
  },
];

export type Step = {
  number: string;
  title: string;
  description: string;
};

export const steps: Step[] = [
  {
    number: "01",
    title: "Choose your board & stream",
    description: "CBSE or RBSE — PCM, PCB, or PCMB. StudyOS sets itself up for you.",
  },
  {
    number: "02",
    title: "Track your syllabus",
    description: "Your ready-made Class 12 syllabus, organized subject by subject.",
  },
  {
    number: "03",
    title: "Add homework & record marks",
    description: "Every task and every test score, kept in one calm place.",
  },
  {
    number: "04",
    title: "Get your portfolio, automatically",
    description: "Your academic profile builds itself from the work you do.",
  },
];
