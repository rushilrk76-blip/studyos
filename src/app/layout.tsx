import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
// next/font downloads the fonts at build time — no layout shift, no external requests at runtime.
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // becomes Tailwind's font-sans (see globals.css)
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces", // becomes Tailwind's font-display
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "StudyOS — Class 12 Study & Academic Portfolio",
    template: "%s · StudyOS",
  },
  description:
    "StudyOS is a Class 12 academic productivity platform for syllabus tracking, practice, homework, marks, and student portfolios.",
  applicationName: "StudyOS",
  openGraph: {
    title: "StudyOS — Class 12 Study & Academic Portfolio",
    description:
      "Track your syllabus, practice questions, manage homework, record your marks, and build your academic portfolio — all in one place.",
    siteName: "StudyOS",
    type: "website",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#faf8f4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        {/*
          Theme script — runs before React hydrates so there's no
          flash of the wrong theme. Reads the stored preference and
          applies data-theme="dark" if needed.
        */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('studyos:theme:v1')||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();`;
