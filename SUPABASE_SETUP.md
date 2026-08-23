# StudyOS — Supabase Setup Guide

This guide walks you through setting up Supabase for StudyOS. It is
written for beginners — no prior database experience needed.

## When do you need Supabase?

**Right now, you don't.** StudyOS works fully without Supabase using
browser localStorage. Supabase is needed only when you want:

- Student accounts (login)
- Cloud sync across devices
- Shared progress

Until then, the app works perfectly local-first.

## Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (free).
2. Click **New Project**.
3. Name it `studyos` (or anything you like).
4. Choose a strong database password — **save it somewhere safe**.
5. Pick the region closest to your students.
6. Click **Create new project** and wait ~2 minutes.

## Step 2 — Find your project URL and anon key

1. In your Supabase dashboard, go to **Settings → API**.
2. You'll see:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon public** key — a long string starting with `eyJ...`

3. **You need BOTH of these.** You do NOT need the `service_role` key
   — that is for server-side code only and must never go in the browser.

## Step 3 — Add environment variables

Create a file called `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5...
```

> Both variables use `NEXT_PUBLIC_` because the browser needs them.
> This is safe — the anon key is designed for frontend use, and Row
> Level Security protects all data at the database level.

## Step 4 — Run the database migration

1. In your Supabase dashboard, go to **SQL Editor**.
2. Click **New Query**.
3. Open the file `supabase/migrations/001_initial_schema.sql` from
   this project.
4. Copy its entire contents into the SQL Editor.
5. Click **Run**.

This creates all 8 tables, indexes, and security policies. You should
see "Success" with no errors.

## Step 5 — Verify Row Level Security (RLS)

After running the migration, verify RLS is enabled:

1. Go to **Table Editor**.
2. Click on any table (e.g. `profiles`).
3. Look for the **RLS Enabled** badge.

RLS ensures:
- Student A **cannot** read Student B's data
- Every row is owned by the authenticated user who created it
- No public read/write access to private student data

## What the tables store

| Table | What it stores |
|---|---|
| `profiles` | Student name, board, stream, Student ID |
| `syllabus_progress` | Completed topic IDs |
| `practice_progress` | Completed practice question IDs |
| `tasks` | Homework + planner tasks |
| `exam_results` | Test/exam scores |
| `projects` | Student projects |
| `certificates` | Student certificates |
| `student_settings` | Theme + notification preferences |

**What is NOT stored in the database:** the complete Class 12 syllabus
and practice question definitions. These are application code
(`src/data/syllabus`) and are shared by all students.

## Step 4b — Run the access control migration

After the initial schema, run the second migration for accounts and access control:

1. Open `supabase/migrations/002_access_control.sql`.
2. Copy its contents into the Supabase SQL Editor.
3. Click **Run**.

This adds:
- Account status (`active`/`blocked`/`expired`/`pending`) + access expiry dates
- `user_roles` table (admin / student roles)
- `device_sessions` table (device limit enforcement)
- A trigger preventing students from modifying their own access fields
- A `check_student_access()` function that verifies access server-side

## Login flow

When Supabase is configured, students log in at `/login` using:
- **Student ID** (e.g. `STU001`)
- **Password** (handled by Supabase Auth — never stored in our tables)

The app maps the Student ID to a synthetic email internally
(e.g. `stu001@studyos.local`). The student never sees this.

Access is verified through the `check_student_access()` PostgreSQL function,
which checks status + date range at the database level — it cannot be
bypassed from the frontend.

## What happens next

This setup creates the **database foundation + access control**. The next phase will:

1. Wire Supabase Auth into the UI (real login)
2. Connect the cloud data service to the app shell
3. Migrate localStorage data to the cloud (with user consent)
4. Enable cross-device sync
5. Build the admin dashboard for account management

Until then, StudyOS continues working fully with localStorage.

## Troubleshooting

**"supabase is null"**
→ Your `.env.local` is missing or the variable names are wrong.
  Check that both `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set.

**"permission denied"**
→ RLS is blocking the request. This is expected until you add
  authentication. Log in first, then the policies will allow access.

**"relation does not exist"**
→ The migration SQL hasn't been run yet. Go to SQL Editor and run
  `supabase/migrations/001_initial_schema.sql`.
