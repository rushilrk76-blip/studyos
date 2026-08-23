# StudyOS

**Your Class 12 journey, organized.**

StudyOS is a Class 12 academic productivity platform for CBSE and RBSE students. Track your syllabus, practice questions, manage homework, record your marks, and build your academic portfolio — all in one place.

## Features

- **Complete Class 12 syllabus tracking** — every CBSE & RBSE chapter and topic, with per-topic completion
- **Board separation** — CBSE and RBSE are fully independent datasets
- **Streams** — PCM · PCB · PCMB
- **Mathematics practice** — chapter-wise, with set-wise question tracking
- **Physics numericals** — chapter / topic / formula-organized practice
- **Chemistry practice** — chapter / topic / concept-organized practice
- **Homework & tasks** — priorities, due dates, overdue detection, search, filtering
- **Study Planner** — today view, upcoming view, monthly calendar, recurring tasks
- **Reminders** — optional browser notifications (local-only; requires the app to be open)
- **Marks & performance** — exam results, averages, best scores, trends, subject breakdowns, chart
- **Academic portfolio** — automatically assembled from your real activity
- **Projects & certificates** — add your own academic work
- **Global search** — press Ctrl/Cmd+K to search everything
- **Backup & restore** — export/import your data as JSON for cross-device moves
- **Local-first storage** — all data stays in your browser

## Tech Stack

- **Next.js 16** (App Router)
- **React 19** · TypeScript
- **Tailwind CSS 4**
- **Lucide React** icons
- **localStorage** — via a centralized service layer (future-ready for Supabase)

> **Current architecture:** user data is stored **locally in the browser**.
> There is no cloud sync, no authentication, and no backend database in this version.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production Build

```bash
npm run build
npm start
```

## Quality Assurance

```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript
```

Plus three audit scripts that verify the syllabus & practice datasets:

```bash
npx tsx scripts/audit-practice.ts
npx tsx scripts/audit-science-practice.ts
```

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for deploying to Vercel.

## Architecture Notes

- **Service layer** (`src/services/`) — every page accesses data through services, never localStorage directly. When a backend is added later, only the storage implementation changes.
- **BACKEND_MIGRATION.md** — documents how the future migration to Supabase will work.
- **Stable IDs everywhere** — syllabus topics, practice questions, tasks, results, projects and certificates never use array indexes.
