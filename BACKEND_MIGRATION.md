# StudyOS — Backend Migration Guide

This document explains how to migrate StudyOS from **localStorage** to a cloud
backend (Supabase or similar) without rewriting the UI.

## Current Architecture

```
┌─────────────────────────────────────────┐
│  UI Layer (React components / pages)     │
│  Dashboard, Syllabus, Practice,          │
│  Homework, Marks, Portfolio, Profile     │
└──────────────────┬──────────────────────┘
                   │  imports from @/services
                   ▼
┌─────────────────────────────────────────┐
│  Service Layer (src/services/)           │
│  studentService, syllabusService,        │
│  practiceService, taskService,           │
│  examService, portfolioService,          │
│  dataService                              │
└──────────────────┬──────────────────────┘
                   │  delegates to
                   ▼
┌─────────────────────────────────────────┐
│  Storage Implementation                  │
│  src/lib/*-storage.ts → localStorage     │
└─────────────────────────────────────────┘
```

**Components NEVER import from `@/lib/*-storage` directly.**
Every data access goes through the service layer.

## What Needs to Change for Supabase

Only the **Storage Implementation** layer changes. The service signatures
stay the same (they just become `async`).

### Step-by-step migration

1. **Install Supabase client**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Create a Supabase client module**
   ```
   src/lib/supabase-client.ts
   ```
   Reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

3. **Replace each storage module's implementation**

   For each `src/lib/*-storage.ts` file, replace the localStorage logic
   with Supabase queries. Example for tasks:

   ```typescript
   // BEFORE (localStorage)
   export function loadTasks(): Task[] {
     return JSON.parse(localStorage.getItem("studyos:tasks:v1") || "[]");
   }

   // AFTER (Supabase)
   export async function loadTasks(): Promise<Task[]> {
     const { data } = await supabase.from("tasks").select("*");
     return data || [];
   }
   ```

4. **Add `async` to service methods**

   Each service method gets `async`/`await`:

   ```typescript
   // BEFORE
   export const taskService = {
     getTasks(): Task[] {
       return loadTasks();
     },
   };

   // AFTER
   export const taskService = {
     async getTasks(): Promise<Task[]> {
       return loadTasks();
     },
   };
   ```

5. **Update components to `await` service calls**

   Since Next.js App Router supports React Server Components and Suspense,
   most pages can use `async/await` directly. Client components use
   `useEffect` with `await` or a data-fetching hook (e.g. SWR / React Query).

### Which services need a backend table

| Service | Supabase table | Key columns |
|---|---|---|
| `studentService` | `profiles` | `id (auth.uid)`, `name`, `board`, `stream`, `student_id`, `photo_url` |
| `syllabusService` | `topic_completions` | `user_id`, `topic_id`, `completed_at` |
| `practiceService` (maths) | `practice_completions` | `user_id`, `question_id`, `completed_at` |
| `practiceService` (science) | `practice_completions` | (same table, different question IDs) |
| `taskService` | `tasks` | `id`, `user_id`, `title`, `subject`, `type`, `due_date`, `priority`, `notes`, `completed`, `completed_at` |
| `examService` | `exam_results` | `id`, `user_id`, `exam_name`, `exam_type`, `subject`, `marks_obtained`, `maximum_marks`, `exam_date`, `notes` |
| `portfolioService` | `projects`, `certificates` | `id`, `user_id`, title/description/link fields |
| `dataService` | — | No table; becomes a Supabase export/import function |

### What does NOT change

- **Static syllabus data** (`src/data/syllabus/`) — this is application data,
  not per-user. It stays as code and is never stored in a database table.
- **All calculation functions** (`calculateOverallProgress`, `calculateStats`,
  `calculateTaskStats`, etc.) — these are pure functions that take data as
  input. They don't care where the data came from.
- **All UI components** — they already call the service layer. Only the
  `async`/`await` keyword needs adding.
- **Types** — `StudentProfile`, `Task`, `ExamResult`, `Project`, `Certificate`
  stay exactly the same; they map directly to table rows.

## Data Security Notes

- **localStorage is NOT secure.** It's suitable for local-first / prototype
  usage but must not be treated as secure cloud storage.
- No passwords, authentication tokens, or secrets are stored in localStorage.
- Supabase Row Level Security (RLS) should ensure each student can only
  read/write their own data once authentication is added.

## Data Versioning

`DATA_VERSION` (currently `1`) in `src/lib/data-keys.ts` allows future
schema migrations. When the data shape changes:

1. Bump `DATA_VERSION` to `2`.
2. Add a migration function that reads old-format data and transforms it.
3. Call the migration on app startup if the stored version is old.

With Supabase, migrations happen via SQL migrations instead.
