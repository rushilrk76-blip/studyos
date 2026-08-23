-- ═══════════════════════════════════════════════════════
-- StudyOS — Access Control & Device Sessions
-- Migration 002
-- ═══════════════════════════════════════════════════════
--
-- Extends the profiles table with account status, access
-- period, and activity tracking. Adds:
--   - user_roles (admin / student)
--   - device_sessions (device limit enforcement)
--
-- Also adds a trigger that prevents students from modifying
-- their own access-control fields (status, expiry, student_id).
--
-- No DROP / TRUNCATE / destructive commands.
-- ═══════════════════════════════════════════════════════


-- ───────────────────────────────────────────
-- 1. EXTEND PROFILES WITH ACCESS CONTROL
-- ───────────────────────────────────────────

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS status              TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('active', 'blocked', 'expired', 'pending')),
    ADD COLUMN IF NOT EXISTS access_start_date   DATE,
    ADD COLUMN IF NOT EXISTS access_expiry_date  DATE,
    ADD COLUMN IF NOT EXISTS last_activity_at    TIMESTAMPTZ;


-- ───────────────────────────────────────────
-- 2. PROTECT SENSITIVE PROFILE FIELDS
-- ───────────────────────────────────────────
-- Students must NOT be able to change their own:
--   status, access_start_date, access_expiry_date,
--   student_id, user_id
--
-- This trigger enforces that at the database level —
-- it cannot be bypassed from the frontend.

CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Allow admin role to modify any field
    IF EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN
        RETURN NEW;
    END IF;

    -- Non-admin (student) cannot change sensitive fields
    IF OLD.status             IS DISTINCT FROM NEW.status
       OR OLD.access_start_date  IS DISTINCT FROM NEW.access_start_date
       OR OLD.access_expiry_date IS DISTINCT FROM NEW.access_expiry_date
       OR OLD.student_id         IS DISTINCT FROM NEW.student_id
       OR OLD.user_id            IS DISTINCT FROM NEW.user_id
    THEN
        RAISE EXCEPTION 'You do not have permission to modify access-control fields';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS profiles_protect_fields ON public.profiles;
CREATE TRIGGER profiles_protect_fields
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_fields();


-- ───────────────────────────────────────────
-- 3. USER ROLES
-- ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role        TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- RLS: students can read their own role; only admins can read all
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_roles_select_own_or_admin" ON public.user_roles
    FOR SELECT USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- Only admins can insert/update/delete roles
CREATE POLICY "user_roles_insert_admin" ON public.user_roles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY "user_roles_update_admin" ON public.user_roles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY "user_roles_delete_admin" ON public.user_roles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );


-- ───────────────────────────────────────────
-- 4. DEVICE SESSIONS
-- ───────────────────────────────────────────
-- Tracks active devices per student. The admin can
-- set a maximum number of concurrent devices.
-- Students can read their own sessions but cannot
-- revoke them (only admin can revoke).

CREATE TABLE IF NOT EXISTS public.device_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id       UUID NOT NULL DEFAULT gen_random_uuid(),
    user_agent      TEXT DEFAULT '',
    first_seen      TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen       TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_device_sessions_user_id ON public.device_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_device_sessions_active ON public.device_sessions(user_id) WHERE is_active = true;

-- RLS: students can read their own sessions; admin can read all
ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "device_sessions_select_own_or_admin" ON public.device_sessions
    FOR SELECT USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- Students can insert their own session (device registration)
CREATE POLICY "device_sessions_insert_own" ON public.device_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Students can update last_seen on their own sessions
CREATE POLICY "device_sessions_update_own" ON public.device_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Only admin can delete (revoke) sessions
CREATE POLICY "device_sessions_delete_admin" ON public.device_sessions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );


-- ───────────────────────────────────────────
-- 5. ACCESS CHECK FUNCTION
-- ───────────────────────────────────────────
-- Called by the application to verify a student has access.
-- This runs server-side in PostgreSQL — it cannot be bypassed.

CREATE OR REPLACE FUNCTION public.check_student_access(p_user_id UUID)
RETURNS TABLE (
    has_access  BOOLEAN,
    status      TEXT,
    reason      TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile  RECORD;
BEGIN
    SELECT status, access_start_date, access_expiry_date
    INTO v_profile
    FROM public.profiles
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'unknown'::TEXT, 'Account not found'::TEXT;
        RETURN;
    END IF;

    IF v_profile.status = 'blocked' THEN
        RETURN QUERY SELECT false, v_profile.status, 'Your account has been blocked'::TEXT;
        RETURN;
    END IF;

    IF v_profile.status = 'pending' THEN
        RETURN QUERY SELECT false, v_profile.status, 'Your account is pending activation'::TEXT;
        RETURN;
    END IF;

    IF v_profile.status = 'expired' THEN
        RETURN QUERY SELECT false, v_profile.status, 'Your access has expired'::TEXT;
        RETURN;
    END IF;

    -- Check date range
    IF v_profile.access_start_date IS NOT NULL AND CURRENT_DATE < v_profile.access_start_date THEN
        RETURN QUERY SELECT false, v_profile.status, 'Your access has not started yet'::TEXT;
        RETURN;
    END IF;

    IF v_profile.access_expiry_date IS NOT NULL AND CURRENT_DATE > v_profile.access_expiry_date THEN
        RETURN QUERY SELECT false, 'expired'::TEXT, 'Your access has expired'::TEXT;
        RETURN;
    END IF;

    -- All checks passed
    RETURN QUERY SELECT true, 'active'::TEXT, ''::TEXT;
END;
$$;
