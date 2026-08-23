-- ═══════════════════════════════════════════════════════
-- StudyOS — Initial Database Schema
-- ═══════════════════════════════════════════════════════
--
-- This migration creates the student-specific data tables for
-- StudyOS. The static Class 12 syllabus / practice definitions
-- remain in application code (src/data/syllabus) and are NOT
-- stored here.
--
-- Row Level Security (RLS) is enabled on every table so that
-- students can only access their own data.
--
-- Run this in the Supabase SQL Editor or via:
--   supabase db push
-- ═══════════════════════════════════════════════════════


-- ───────────────────────────────────────────
-- 1. PROFILES
-- ───────────────────────────────────────────
-- One row per student. Maps to the StudentProfile type.
-- user_id links to Supabase Auth (auth.users.id).

CREATE TABLE IF NOT EXISTS public.profiles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    board       TEXT NOT NULL CHECK (board IN ('cbse', 'rbse')),
    stream      TEXT NOT NULL CHECK (stream IN ('pcm', 'pcb', 'pcmb')),
    student_id  TEXT NOT NULL UNIQUE,
    photo_url   TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Auto-update updated_at on profile changes
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();


-- ───────────────────────────────────────────
-- 2. SYLLABUS PROGRESS
-- ───────────────────────────────────────────
-- One row per completed topic. topic_id is the stable
-- application-level ID (e.g. "cbse-physics-ch1-t3").

CREATE TABLE IF NOT EXISTS public.syllabus_progress (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id      TEXT NOT NULL,
    completed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_syllabus_progress_user_id ON public.syllabus_progress(user_id);


-- ───────────────────────────────────────────
-- 3. PRACTICE PROGRESS
-- ───────────────────────────────────────────
-- One row per completed practice question. Covers both
-- Maths (practice_type = 'maths') and Physics/Chemistry
-- (practice_type = 'science').

CREATE TABLE IF NOT EXISTS public.practice_progress (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id    TEXT NOT NULL,
    practice_type  TEXT NOT NULL CHECK (practice_type IN ('maths', 'science')),
    completed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_practice_progress_user_id ON public.practice_progress(user_id);


-- ───────────────────────────────────────────
-- 4. TASKS
-- ───────────────────────────────────────────
-- Homework + Planner share ONE table (same Task model).

CREATE TABLE IF NOT EXISTS public.tasks (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title        TEXT NOT NULL,
    subject      TEXT NOT NULL,
    type         TEXT NOT NULL DEFAULT 'Homework',
    due_date     DATE NOT NULL,
    due_time     TEXT,
    priority     TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    notes        TEXT DEFAULT '',
    completed    BOOLEAN NOT NULL DEFAULT false,
    recurrence   TEXT DEFAULT 'None',
    reminder     TEXT DEFAULT 'None',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

CREATE TRIGGER tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();


-- ───────────────────────────────────────────
-- 5. EXAM RESULTS
-- ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.exam_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exam_name       TEXT NOT NULL,
    exam_type       TEXT NOT NULL DEFAULT 'Unit Test',
    subject         TEXT NOT NULL,
    marks_obtained  NUMERIC NOT NULL CHECK (marks_obtained >= 0),
    maximum_marks   NUMERIC NOT NULL CHECK (maximum_marks > 0),
    exam_date       DATE NOT NULL,
    notes           TEXT DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exam_results_user_id ON public.exam_results(user_id);


-- ───────────────────────────────────────────
-- 6. PROJECTS
-- ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.projects (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT DEFAULT '',
    subject     TEXT DEFAULT '',
    date        DATE,
    link        TEXT DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);


-- ───────────────────────────────────────────
-- 7. CERTIFICATES
-- ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.certificates (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    organization  TEXT DEFAULT '',
    date          DATE,
    link          TEXT DEFAULT '',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.certificates(user_id);


-- ───────────────────────────────────────────
-- 8. STUDENT SETTINGS
-- ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.student_settings (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    theme            TEXT DEFAULT 'system',
    study_reminders  BOOLEAN DEFAULT false,
    task_reminders   BOOLEAN DEFAULT false,
    sound            BOOLEAN DEFAULT false,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER student_settings_updated_at
    BEFORE UPDATE ON public.student_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();


-- ═══════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════
--
-- Every table is RLS-enabled. Students can only read/write
-- rows where user_id = auth.uid() (their own Supabase Auth ID).
--
-- No public read/write — student data is private by default.
-- ═══════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabus_progress     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_progress     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_settings      ENABLE ROW LEVEL SECURITY;

-- ── profiles ──
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = user_id);

-- ── syllabus_progress ──
CREATE POLICY "syllabus_progress_select_own" ON public.syllabus_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "syllabus_progress_insert_own" ON public.syllabus_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "syllabus_progress_delete_own" ON public.syllabus_progress FOR DELETE USING (auth.uid() = user_id);

-- ── practice_progress ──
CREATE POLICY "practice_progress_select_own" ON public.practice_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "practice_progress_insert_own" ON public.practice_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "practice_progress_delete_own" ON public.practice_progress FOR DELETE USING (auth.uid() = user_id);

-- ── tasks ──
CREATE POLICY "tasks_select_own" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tasks_insert_own" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_update_own" ON public.tasks FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_delete_own" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- ── exam_results ──
CREATE POLICY "exam_results_select_own" ON public.exam_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "exam_results_insert_own" ON public.exam_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "exam_results_update_own" ON public.exam_results FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "exam_results_delete_own" ON public.exam_results FOR DELETE USING (auth.uid() = user_id);

-- ── projects ──
CREATE POLICY "projects_select_own" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "projects_insert_own" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects_update_own" ON public.projects FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects_delete_own" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- ── certificates ──
CREATE POLICY "certificates_select_own" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "certificates_insert_own" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "certificates_update_own" ON public.certificates FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "certificates_delete_own" ON public.certificates FOR DELETE USING (auth.uid() = user_id);

-- ── student_settings ──
CREATE POLICY "student_settings_select_own" ON public.student_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "student_settings_insert_own" ON public.student_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "student_settings_update_own" ON public.student_settings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "student_settings_delete_own" ON public.student_settings FOR DELETE USING (auth.uid() = user_id);
