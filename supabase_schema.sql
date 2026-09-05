-- ==============================================================================
-- Class Updates & Homework Tracking Application
-- Database Schema & Atomic RPC Migration for Supabase (PostgreSQL)
-- Supports English Levels (Pre-A to 8) & Math BTM (Summit / 1 to 32) & CTM (1 to 32 / X)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. CREATE CORE TABLES
-- ==============================================================================

-- 2.1 INSTRUCTORS TABLE
CREATE TABLE IF NOT EXISTS public.instructors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.2 USER PROFILES TABLE (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'instructor' CHECK (role IN ('admin', 'instructor')),
    instructor_id UUID REFERENCES public.instructors(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.3 STUDENTS TABLE (Stores latest/default level preferences for automatic prefill)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    notes TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    default_english_level TEXT,
    default_btm_level TEXT,
    default_ctm_level TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.4 SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.5 LEVELS TABLE
CREATE TABLE IF NOT EXISTS public.levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL DEFAULT 'English' CHECK (category IN ('English', 'BTM', 'CTM', 'General')),
    name TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (category, name)
);

-- 2.6 CLASS UPDATES TABLE
CREATE TABLE IF NOT EXISTS public.class_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
    instructor_id UUID NOT NULL REFERENCES public.instructors(id) ON DELETE RESTRICT,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
    level_id UUID REFERENCES public.levels(id) ON DELETE SET NULL,
    english_level TEXT,
    btm_level TEXT,
    ctm_level TEXT,
    class_date DATE NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
    booklet_number TEXT,
    cw TEXT, -- Classwork
    hw TEXT, -- Homework description
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Duplicate prevention constraint (student, instructor, subject, class_date)
ALTER TABLE public.class_updates 
DROP CONSTRAINT IF EXISTS unique_student_class_record;

ALTER TABLE public.class_updates 
ADD CONSTRAINT unique_student_class_record 
UNIQUE (student_id, instructor_id, subject_id, class_date);

-- 2.7 HOMEWORK TABLE (Separate Entity)
CREATE TABLE IF NOT EXISTS public.homework (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_update_id UUID NOT NULL REFERENCES public.class_updates(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    homework_text TEXT NOT NULL,
    assigned_date DATE NOT NULL,
    checked BOOLEAN NOT NULL DEFAULT false,
    checked_date DATE,
    checked_by UUID REFERENCES public.instructors(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.8 AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. CREATE INDEXES FOR FAST QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_class_updates_student_date ON public.class_updates(student_id, class_date DESC);
CREATE INDEX IF NOT EXISTS idx_class_updates_instructor_date ON public.class_updates(instructor_id, class_date DESC);
CREATE INDEX IF NOT EXISTS idx_class_updates_date ON public.class_updates(class_date DESC);

CREATE INDEX IF NOT EXISTS idx_homework_pending ON public.homework(student_id, assigned_date, checked) WHERE checked = false;
CREATE INDEX IF NOT EXISTS idx_homework_class_update_id ON public.homework(class_update_id);
CREATE INDEX IF NOT EXISTS idx_students_active ON public.students(active, name);
CREATE INDEX IF NOT EXISTS idx_instructors_active ON public.instructors(active, name);

-- ==============================================================================
-- 4. HELPER TRIGGER FOR UPDATING `updated_at` TIMESTAMP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_instructors_updated_at ON public.instructors;
CREATE TRIGGER trg_instructors_updated_at BEFORE UPDATE ON public.instructors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_students_updated_at ON public.students;
CREATE TRIGGER trg_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_subjects_updated_at ON public.subjects;
CREATE TRIGGER trg_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_levels_updated_at ON public.levels;
CREATE TRIGGER trg_levels_updated_at BEFORE UPDATE ON public.levels FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_class_updates_updated_at ON public.class_updates;
CREATE TRIGGER trg_class_updates_updated_at BEFORE UPDATE ON public.class_updates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_homework_updated_at ON public.homework;
CREATE TRIGGER trg_homework_updated_at BEFORE UPDATE ON public.homework FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 5. ATOMIC RPC FUNCTION: SAVE CLASS UPDATE
-- ==============================================================================
-- Handles creating class record, updating student's default level, creating homework record,
-- and marking previous HW in a single atomic transaction
CREATE OR REPLACE FUNCTION public.save_class_update(
    p_student_id UUID,
    p_instructor_id UUID,
    p_subject_id UUID,
    p_level_id UUID DEFAULT NULL,
    p_english_level TEXT DEFAULT NULL,
    p_btm_level TEXT DEFAULT NULL,
    p_ctm_level TEXT DEFAULT NULL,
    p_class_date DATE DEFAULT CURRENT_DATE,
    p_duration_minutes INTEGER DEFAULT 60,
    p_booklet_number TEXT DEFAULT NULL,
    p_cw TEXT DEFAULT NULL,
    p_hw TEXT DEFAULT NULL,
    p_checked_homework_ids UUID[] DEFAULT ARRAY[]::UUID[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_class_update_id UUID;
    v_new_homework_id UUID := NULL;
    v_checked_count INTEGER := 0;
    v_user_id UUID;
    v_result JSONB;
BEGIN
    -- Get the authenticated user ID
    v_user_id := auth.uid();

    -- 1. Insert new Class Update record
    INSERT INTO public.class_updates (
        student_id,
        instructor_id,
        subject_id,
        level_id,
        english_level,
        btm_level,
        ctm_level,
        class_date,
        duration_minutes,
        booklet_number,
        cw,
        hw,
        created_by
    ) VALUES (
        p_student_id,
        p_instructor_id,
        p_subject_id,
        p_level_id,
        NULLIF(TRIM(p_english_level), ''),
        NULLIF(TRIM(p_btm_level), ''),
        NULLIF(TRIM(p_ctm_level), ''),
        p_class_date,
        p_duration_minutes,
        NULLIF(TRIM(p_booklet_number), ''),
        NULLIF(TRIM(p_cw), ''),
        NULLIF(TRIM(p_hw), ''),
        v_user_id
    ) RETURNING id INTO v_class_update_id;

    -- 2. Update Student's latest remembered levels for future auto-prefill
    UPDATE public.students
    SET 
        default_english_level = COALESCE(NULLIF(TRIM(p_english_level), ''), default_english_level),
        default_btm_level = COALESCE(NULLIF(TRIM(p_btm_level), ''), default_btm_level),
        default_ctm_level = COALESCE(NULLIF(TRIM(p_ctm_level), ''), default_ctm_level),
        updated_at = timezone('utc'::text, now())
    WHERE id = p_student_id;

    -- 3. Insert new Homework entity if HW text is provided
    IF p_hw IS NOT NULL AND TRIM(p_hw) <> '' THEN
        INSERT INTO public.homework (
            student_id,
            class_update_id,
            subject_id,
            homework_text,
            assigned_date,
            checked
        ) VALUES (
            p_student_id,
            v_class_update_id,
            p_subject_id,
            TRIM(p_hw),
            p_class_date,
            false
        ) RETURNING id INTO v_new_homework_id;
    END IF;

    -- 4. Update previous unchecked homework records to checked
    IF p_checked_homework_ids IS NOT NULL AND array_length(p_checked_homework_ids, 1) > 0 THEN
        UPDATE public.homework
        SET 
            checked = true,
            checked_date = p_class_date,
            checked_by = p_instructor_id,
            updated_at = timezone('utc'::text, now())
        WHERE 
            id = ANY(p_checked_homework_ids)
            AND student_id = p_student_id
            AND checked = false;

        GET DIAGNOSTICS v_checked_count = ROW_COUNT;
    END IF;

    -- 5. Build JSON return response
    v_result := jsonb_build_object(
        'success', true,
        'class_update_id', v_class_update_id,
        'homework_id', v_new_homework_id,
        'checked_homework_count', v_checked_count
    );

    RETURN v_result;

EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'A class record already exists for this student, instructor, subject on %', p_class_date;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to save class update: %', SQLERRM;
END;
$$;

-- ==============================================================================
-- 5.1 ADMIN RPC: SET / RESET / CREATE INSTRUCTOR PASSWORD IN AUTH
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.admin_set_user_password(
    p_user_email TEXT,
    p_new_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_user_id UUID;
    v_encrypted_pw TEXT;
    v_instructor_name TEXT;
    v_instructor_id UUID;
BEGIN
    -- 1. Verify caller is an admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied. Only administrators can set or reset instructor passwords.';
    END IF;

    -- 2. Validate password length
    IF p_new_password IS NULL OR length(trim(p_new_password)) < 6 THEN
        RAISE EXCEPTION 'Password must be at least 6 characters long.';
    END IF;

    -- 3. Generate encrypted password hash using bcrypt
    v_encrypted_pw := extensions.crypt(trim(p_new_password), extensions.gen_salt('bf', 10));

    -- 4. Check if user already exists in auth.users
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE LOWER(email) = LOWER(trim(p_user_email)) 
    LIMIT 1;

    -- 5. If user exists, update password and confirm email
    IF v_user_id IS NOT NULL THEN
        UPDATE auth.users
        SET 
            encrypted_password = v_encrypted_pw,
            email_confirmed_at = COALESCE(email_confirmed_at, timezone('utc'::text, now())),
            updated_at = timezone('utc'::text, now())
        WHERE id = v_user_id;

        -- Ensure profile row exists
        INSERT INTO public.profiles (id, email, full_name, role)
        SELECT 
            v_user_id, 
            LOWER(trim(p_user_email)), 
            COALESCE(name, split_part(p_user_email, '@', 1)), 
            'instructor'
        FROM public.instructors
        WHERE LOWER(email) = LOWER(trim(p_user_email))
        ON CONFLICT (id) DO UPDATE SET 
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name;

        -- Ensure identity exists in auth.identities
        BEGIN
            INSERT INTO auth.identities (
                id,
                user_id,
                identity_data,
                provider,
                provider_id,
                last_sign_in_at,
                created_at,
                updated_at
            ) VALUES (
                v_user_id::text,
                v_user_id,
                jsonb_build_object('sub', v_user_id::text, 'email', LOWER(trim(p_user_email))),
                'email',
                LOWER(trim(p_user_email)),
                timezone('utc'::text, now()),
                timezone('utc'::text, now()),
                timezone('utc'::text, now())
            )
            ON CONFLICT DO NOTHING;
        EXCEPTION WHEN OTHERS THEN
            -- Ignore identity variation if already present
        END;

        RETURN jsonb_build_object(
            'success', true, 
            'message', 'Password successfully updated for ' || p_user_email
        );
    END IF;

    -- 6. If user does NOT exist in auth.users yet, CREATE THEM!
    SELECT id, name INTO v_instructor_id, v_instructor_name
    FROM public.instructors
    WHERE LOWER(email) = LOWER(trim(p_user_email))
    LIMIT 1;

    IF v_instructor_name IS NULL THEN
        v_instructor_name := split_part(p_user_email, '@', 1);
    END IF;

    v_user_id := gen_random_uuid();

    -- Insert into auth.users (omit instance_id to prevent type mismatch)
    INSERT INTO auth.users (
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        'authenticated',
        'authenticated',
        LOWER(trim(p_user_email)),
        v_encrypted_pw,
        timezone('utc'::text, now()),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('full_name', v_instructor_name),
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    );

    -- Create profile row
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (v_user_id, LOWER(trim(p_user_email)), v_instructor_name, 'instructor')
    ON CONFLICT (id) DO UPDATE SET 
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name;

    -- Insert into auth.identities
    BEGIN
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            v_user_id::text,
            v_user_id,
            jsonb_build_object('sub', v_user_id::text, 'email', LOWER(trim(p_user_email))),
            'email',
            LOWER(trim(p_user_email)),
            timezone('utc'::text, now()),
            timezone('utc'::text, now()),
            timezone('utc'::text, now())
        )
        ON CONFLICT DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
        -- Ignore identity table variation
    END;

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'New user account created and password set for ' || p_user_email
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_user_password(TEXT, TEXT) TO authenticated, service_role;

-- ==============================================================================
-- 5.2 ADMIN / AUTHOR RPC: UPDATE CLASS UPDATE
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.update_class_update(
    p_class_update_id UUID,
    p_student_id UUID,
    p_instructor_id UUID,
    p_subject_id UUID,
    p_level_id UUID DEFAULT NULL,
    p_english_level TEXT DEFAULT NULL,
    p_btm_level TEXT DEFAULT NULL,
    p_ctm_level TEXT DEFAULT NULL,
    p_class_date DATE DEFAULT CURRENT_DATE,
    p_duration_minutes INTEGER DEFAULT 60,
    p_booklet_number TEXT DEFAULT NULL,
    p_cw TEXT DEFAULT NULL,
    p_hw TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_created_by UUID;
    v_existing_hw_id UUID;
BEGIN
    v_user_id := auth.uid();

    -- Check if record exists and caller has permission (Admin OR Original Author)
    SELECT created_by INTO v_created_by
    FROM public.class_updates
    WHERE id = p_class_update_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Class update record with ID % not found', p_class_update_id;
    END IF;

    IF NOT (public.is_admin() OR v_created_by = v_user_id) THEN
        RAISE EXCEPTION 'Access denied. Only administrators or the author can modify this class record.';
    END IF;

    -- 1. Update the Class Update record
    UPDATE public.class_updates
    SET
        student_id = p_student_id,
        instructor_id = p_instructor_id,
        subject_id = p_subject_id,
        level_id = p_level_id,
        english_level = NULLIF(TRIM(p_english_level), ''),
        btm_level = NULLIF(TRIM(p_btm_level), ''),
        ctm_level = NULLIF(TRIM(p_ctm_level), ''),
        class_date = p_class_date,
        duration_minutes = p_duration_minutes,
        booklet_number = NULLIF(TRIM(p_booklet_number), ''),
        cw = NULLIF(TRIM(p_cw), ''),
        hw = NULLIF(TRIM(p_hw), ''),
        updated_at = timezone('utc'::text, now())
    WHERE id = p_class_update_id;

    -- 2. Update Student remembered default levels if provided
    UPDATE public.students
    SET
        default_english_level = COALESCE(NULLIF(TRIM(p_english_level), ''), default_english_level),
        default_btm_level = COALESCE(NULLIF(TRIM(p_btm_level), ''), default_btm_level),
        default_ctm_level = COALESCE(NULLIF(TRIM(p_ctm_level), ''), default_ctm_level),
        updated_at = timezone('utc'::text, now())
    WHERE id = p_student_id;

    -- 3. Synchronize linked Homework entity
    SELECT id INTO v_existing_hw_id
    FROM public.homework
    WHERE class_update_id = p_class_update_id
    LIMIT 1;

    IF p_hw IS NOT NULL AND TRIM(p_hw) <> '' THEN
        IF v_existing_hw_id IS NOT NULL THEN
            UPDATE public.homework
            SET
                student_id = p_student_id,
                subject_id = p_subject_id,
                homework_text = TRIM(p_hw),
                assigned_date = p_class_date,
                updated_at = timezone('utc'::text, now())
            WHERE id = v_existing_hw_id;
        ELSE
            INSERT INTO public.homework (
                student_id,
                class_update_id,
                subject_id,
                homework_text,
                assigned_date,
                checked
            ) VALUES (
                p_student_id,
                p_class_update_id,
                p_subject_id,
                TRIM(p_hw),
                p_class_date,
                false
            );
        END IF;
    ELSE
        -- If homework text was cleared, remove unchecked homework record linked to this class
        IF v_existing_hw_id IS NOT NULL THEN
            DELETE FROM public.homework
            WHERE id = v_existing_hw_id AND checked = false;
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'class_update_id', p_class_update_id,
        'message', 'Class update modified successfully'
    );

EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'A class record already exists for this student, instructor, and subject on %', p_class_date;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to update class record: %', SQLERRM;
END;
$$;

-- ==============================================================================
-- 5.3 ADMIN RPC: DELETE CLASS UPDATE
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.delete_class_update(
    p_class_update_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied. Only administrators can delete class records.';
    END IF;

    DELETE FROM public.class_updates
    WHERE id = p_class_update_id;

    RETURN jsonb_build_object(
        'success', true,
        'class_update_id', p_class_update_id,
        'message', 'Class record deleted successfully'
    );
END;
$$;


-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) & POLICIES
-- ==============================================================================

-- Helper Functions to check role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- 6.1 Profiles Policies
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Profiles can be updated by user or admin" ON public.profiles;
CREATE POLICY "Profiles can be updated by user or admin" 
ON public.profiles FOR UPDATE TO authenticated 
USING (id = auth.uid() OR public.is_admin());

-- 6.2 Instructors Policies
DROP POLICY IF EXISTS "Instructors are viewable by authenticated users" ON public.instructors;
CREATE POLICY "Instructors are viewable by authenticated users" 
ON public.instructors FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Instructors managed by admin" ON public.instructors;
CREATE POLICY "Instructors managed by admin" 
ON public.instructors FOR ALL TO authenticated 
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6.3 Students Policies
DROP POLICY IF EXISTS "Students viewable by authenticated users" ON public.students;
CREATE POLICY "Students viewable by authenticated users" 
ON public.students FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Students managed by admin" ON public.students;
CREATE POLICY "Students managed by admin" 
ON public.students FOR ALL TO authenticated 
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6.4 Subjects & Levels Policies
DROP POLICY IF EXISTS "Subjects viewable by authenticated users" ON public.subjects;
CREATE POLICY "Subjects viewable by authenticated users" 
ON public.subjects FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Subjects managed by admin" ON public.subjects;
CREATE POLICY "Subjects managed by admin" 
ON public.subjects FOR ALL TO authenticated 
USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Levels viewable by authenticated users" ON public.levels;
CREATE POLICY "Levels viewable by authenticated users" 
ON public.levels FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Levels managed by admin" ON public.levels;
CREATE POLICY "Levels managed by admin" 
ON public.levels FOR ALL TO authenticated 
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6.5 Class Updates Policies
DROP POLICY IF EXISTS "Class updates viewable by authenticated users" ON public.class_updates;
CREATE POLICY "Class updates viewable by authenticated users" 
ON public.class_updates FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Class updates insertable by authenticated users" ON public.class_updates;
CREATE POLICY "Class updates insertable by authenticated users" 
ON public.class_updates FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Class updates updatable by author or admin" ON public.class_updates;
CREATE POLICY "Class updates updatable by author or admin" 
ON public.class_updates FOR UPDATE TO authenticated 
USING (created_by = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Class updates deletable only by admin" ON public.class_updates;
CREATE POLICY "Class updates deletable only by admin" 
ON public.class_updates FOR DELETE TO authenticated 
USING (public.is_admin());

-- 6.6 Homework Policies
DROP POLICY IF EXISTS "Homework viewable by authenticated users" ON public.homework;
CREATE POLICY "Homework viewable by authenticated users" 
ON public.homework FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Homework insertable by authenticated users" ON public.homework;
CREATE POLICY "Homework insertable by authenticated users" 
ON public.homework FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Homework updatable by authenticated users" ON public.homework;
CREATE POLICY "Homework updatable by authenticated users" 
ON public.homework FOR UPDATE TO authenticated USING (true);

-- ==============================================================================
-- 7. DEFAULT SEED DATA
-- ==============================================================================

-- 7.1 Seed Subjects
INSERT INTO public.subjects (name) 
VALUES ('English'), ('Math')
ON CONFLICT (name) DO NOTHING;

-- 7.2 Seed English Levels: Pre-A, A, B, C, D, E, F, G, H, I, 5, 6, 7, 8
INSERT INTO public.levels (category, name, display_order) VALUES
('English', 'Pre-A', 1),
('English', 'A', 2),
('English', 'B', 3),
('English', 'C', 4),
('English', 'D', 5),
('English', 'E', 6),
('English', 'F', 7),
('English', 'G', 8),
('English', 'H', 9),
('English', 'I', 10),
('English', '5', 11),
('English', '6', 12),
('English', '7', 13),
('English', '8', 14)
ON CONFLICT (category, name) DO UPDATE SET display_order = EXCLUDED.display_order;

-- 7.3 Seed Math BTM (Basic Thinking Math) Levels: 'Summit' + 1 to 32
INSERT INTO public.levels (category, name, display_order)
VALUES ('BTM', 'Summit', 0)
ON CONFLICT (category, name) DO NOTHING;

DO $$
BEGIN
    FOR i IN 1..32 LOOP
        INSERT INTO public.levels (category, name, display_order)
        VALUES ('BTM', i::text, i)
        ON CONFLICT (category, name) DO NOTHING;
    END LOOP;
END $$;

-- 7.4 Seed Math CTM (Critical Thinking Math) Levels: 1 to 32 + 'X'
DO $$
BEGIN
    FOR i IN 1..32 LOOP
        INSERT INTO public.levels (category, name, display_order)
        VALUES ('CTM', i::text, i)
        ON CONFLICT (category, name) DO NOTHING;
    END LOOP;
END $$;

INSERT INTO public.levels (category, name, display_order)
VALUES ('CTM', 'X', 99)
ON CONFLICT (category, name) DO NOTHING;

-- 7.5 Seed Instructors (with real IDs and email mappings)
INSERT INTO public.instructors (id, name, email, active) VALUES
('49185b37-5ee8-45b2-9b7b-15911c811741', 'Raj', 'rajaram.class@gmail.com', true),
('3e02d957-db76-4e43-a671-5f53e564a7e3', 'Shriyam', 'chaturvedishriyam5@gmail.com', true),
('7d95d723-012f-4619-a6f0-1f9c8af41190', 'Elma', 'boviii2024@gmail.com', true),
('fa858f4f-1107-43bb-98cb-18f1bb76fef4', 'Ayush', 'ayushsinghbisht62005@gmail.com', true),
('c2688236-e665-43d6-9db5-a4beda965391', 'Himanshi', 'himanshii1605@gmail.com', true),
('56c3a3be-d207-4d4e-8c40-74456525fd01', 'Ravali', 'ravali@example.com', true),
('7242cee1-6067-4cb1-9d03-f543649e8e1f', 'Shaheen', 'shaheensyed2003@gmail.com', true),
('2294db43-39ae-4dbb-97ed-2a30548d5054', 'Lincy', 'lincyrose03@gmail.com', true),
('1e25fd43-bfcb-4c95-a864-996691ee5ac8', 'Priya', 'priya@example.com', true),
('441bbd32-ea6c-48a1-9670-ee65ea4587fa', 'Admin User', 'admin@example.com', true)
ON CONFLICT (id) DO UPDATE 
SET 
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  active = EXCLUDED.active;

-- 7.6 Seed Students with configured English and Math BTM / CTM levels
INSERT INTO public.students (name, default_english_level, default_btm_level, default_ctm_level, active) VALUES
('Arya', '5', '14', '13', true),
('Anish', '5', 'Summit', 'X', true),
('Anith Rao', '6', 'Summit', 'X', true),
('Pragathi', '6', 'Summit', 'X', true),
('Arohi', NULL, '17', '15', true),
('Anay', NULL, '21', '19', true),
('Swara', NULL, '22', '20', true),
('Jia', '6', '21', '19', true),
('Anika', 'F', '9', '7', true),
('Aadvik', '5', NULL, NULL, true),
('Arihan', 'F', '9', '7', true),
('Kiaan', '5', '16', '12', true),
('Mishti', '6', NULL, NULL, true)
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- 8. PARENT PROGRESS REPORT & ACCESS EXTENSION
-- ==============================================================================

-- 8.1 Parent Access Table (Unique URL Token + Hashed PIN per student)
CREATE TABLE IF NOT EXISTS public.parent_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL UNIQUE,
    pin_hash TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    lockout_until TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_student_parent_access UNIQUE (student_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_access_token ON public.parent_access(access_token);
CREATE INDEX IF NOT EXISTS idx_parent_access_student_id ON public.parent_access(student_id);

-- 8.2 Parent Feedback Table
CREATE TABLE IF NOT EXISTS public.parent_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    parent_access_id UUID REFERENCES public.parent_access(id) ON DELETE SET NULL,
    rating TEXT CHECK (rating IN ('good', 'okay', 'needs_attention')),
    feedback_text TEXT,
    contact_requested BOOLEAN NOT NULL DEFAULT false,
    contact_reason TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'responded')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.instructors(id) ON DELETE SET NULL,
    responded_at TIMESTAMPTZ,
    admin_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_parent_feedback_student ON public.parent_feedback(student_id);
CREATE INDEX IF NOT EXISTS idx_parent_feedback_status ON public.parent_feedback(status);
CREATE INDEX IF NOT EXISTS idx_parent_feedback_created ON public.parent_feedback(created_at DESC);

-- Enable RLS
ALTER TABLE public.parent_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_feedback ENABLE ROW LEVEL SECURITY;

-- Policies for Parent Access & Feedback (Admins have full manage access)
DROP POLICY IF EXISTS "Parent access managed by admin" ON public.parent_access;
CREATE POLICY "Parent access managed by admin"
ON public.parent_access FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Parent feedback viewable by authenticated" ON public.parent_feedback;
CREATE POLICY "Parent feedback viewable by authenticated"
ON public.parent_feedback FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Parent feedback managed by authenticated" ON public.parent_feedback;
CREATE POLICY "Parent feedback managed by authenticated"
ON public.parent_feedback FOR UPDATE TO authenticated USING (true);

-- ==============================================================================
-- 8.3 ADMIN RPCs FOR PARENT ACCESS MANAGEMENT
-- ==============================================================================

-- Generate Parent Access Link & PIN
CREATE OR REPLACE FUNCTION public.admin_generate_parent_access(
    p_student_id UUID,
    p_pin TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_token TEXT;
    v_pin_hash TEXT;
    v_result JSONB;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied. Only administrators can manage parent access.';
    END IF;

    IF p_pin IS NULL OR length(trim(p_pin)) < 4 THEN
        RAISE EXCEPTION 'PIN must be at least 4 characters/digits.';
    END IF;

    -- Generate random URL-safe 32-char token
    v_token := encode(gen_random_bytes(24), 'hex');
    v_pin_hash := extensions.crypt(trim(p_pin), extensions.gen_salt('bf', 10));

    INSERT INTO public.parent_access (
        student_id,
        access_token,
        pin_hash,
        active,
        failed_attempts,
        lockout_until,
        created_at,
        updated_at
    ) VALUES (
        p_student_id,
        v_token,
        v_pin_hash,
        true,
        0,
        NULL,
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    )
    ON CONFLICT (student_id) DO UPDATE SET
        access_token = EXCLUDED.access_token,
        pin_hash = EXCLUDED.pin_hash,
        active = true,
        failed_attempts = 0,
        lockout_until = NULL,
        updated_at = timezone('utc'::text, now());

    SELECT jsonb_build_object(
        'success', true,
        'student_id', p_student_id,
        'access_token', v_token,
        'message', 'Parent access generated successfully'
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- Change Parent PIN
CREATE OR REPLACE FUNCTION public.admin_change_parent_pin(
    p_student_id UUID,
    p_new_pin TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_pin_hash TEXT;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied. Only administrators can manage parent access.';
    END IF;

    IF p_new_pin IS NULL OR length(trim(p_new_pin)) < 4 THEN
        RAISE EXCEPTION 'PIN must be at least 4 characters/digits.';
    END IF;

    v_pin_hash := extensions.crypt(trim(p_new_pin), extensions.gen_salt('bf', 10));

    UPDATE public.parent_access
    SET 
        pin_hash = v_pin_hash,
        failed_attempts = 0,
        lockout_until = NULL,
        updated_at = timezone('utc'::text, now())
    WHERE student_id = p_student_id;

    RETURN jsonb_build_object(
        'success', true,
        'student_id', p_student_id,
        'message', 'Parent PIN updated successfully'
    );
END;
$$;

-- Toggle Parent Access Active / Revoked
CREATE OR REPLACE FUNCTION public.admin_toggle_parent_access(
    p_student_id UUID,
    p_active BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied. Only administrators can manage parent access.';
    END IF;

    UPDATE public.parent_access
    SET 
        active = p_active,
        updated_at = timezone('utc'::text, now())
    WHERE student_id = p_student_id;

    RETURN jsonb_build_object(
        'success', true,
        'student_id', p_student_id,
        'active', p_active,
        'message', CASE WHEN p_active THEN 'Parent access enabled' ELSE 'Parent access revoked' END
    );
END;
$$;

-- Regenerate Parent Token (Invalidates old link)
CREATE OR REPLACE FUNCTION public.admin_regenerate_parent_token(
    p_student_id UUID,
    p_pin TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_token TEXT;
    v_pin_hash TEXT;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied. Only administrators can manage parent access.';
    END IF;

    v_token := encode(gen_random_bytes(24), 'hex');

    IF p_pin IS NOT NULL AND length(trim(p_pin)) >= 4 THEN
        v_pin_hash := extensions.crypt(trim(p_pin), extensions.gen_salt('bf', 10));
        UPDATE public.parent_access
        SET 
            access_token = v_token,
            pin_hash = v_pin_hash,
            active = true,
            failed_attempts = 0,
            lockout_until = NULL,
            updated_at = timezone('utc'::text, now())
        WHERE student_id = p_student_id;
    ELSE
        UPDATE public.parent_access
        SET 
            access_token = v_token,
            active = true,
            failed_attempts = 0,
            lockout_until = NULL,
            updated_at = timezone('utc'::text, now())
        WHERE student_id = p_student_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'student_id', p_student_id,
        'access_token', v_token,
        'message', 'New parent link generated successfully (previous link invalidated)'
    );
END;
$$;

-- Get Parent Access Directory for Admin
CREATE OR REPLACE FUNCTION public.admin_get_parent_access_list()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_list JSONB;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied.';
    END IF;

    SELECT jsonb_agg(
        jsonb_build_object(
            'id', pa.id,
            'student_id', s.id,
            'student_name', s.name,
            'student_active', s.active,
            'access_token', pa.access_token,
            'active', COALESCE(pa.active, false),
            'has_pin', (pa.pin_hash IS NOT NULL),
            'last_accessed_at', pa.last_accessed_at,
            'created_at', pa.created_at,
            'updated_at', pa.updated_at
        ) ORDER BY s.name
    ) INTO v_list
    FROM public.students s
    LEFT JOIN public.parent_access pa ON pa.student_id = s.id;

    RETURN COALESCE(v_list, '[]'::jsonb);
END;
$$;

-- Get Parent Feedback List for Staff / Admin
CREATE OR REPLACE FUNCTION public.admin_get_parent_feedback_list()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_list JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', pf.id,
            'student_id', pf.student_id,
            'student_name', s.name,
            'rating', pf.rating,
            'feedback_text', pf.feedback_text,
            'contact_requested', pf.contact_requested,
            'contact_reason', pf.contact_reason,
            'status', pf.status,
            'created_at', pf.created_at,
            'reviewed_at', pf.reviewed_at,
            'reviewed_by_name', i.name,
            'responded_at', pf.responded_at,
            'admin_notes', pf.admin_notes
        ) ORDER BY pf.created_at DESC
    ) INTO v_list
    FROM public.parent_feedback pf
    JOIN public.students s ON s.id = pf.student_id
    LEFT JOIN public.instructors i ON i.id = pf.reviewed_by;

    RETURN COALESCE(v_list, '[]'::jsonb);
END;
$$;

-- Update Feedback Status
CREATE OR REPLACE FUNCTION public.admin_update_feedback_status(
    p_feedback_id UUID,
    p_status TEXT,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_instructor_id UUID;
BEGIN
    -- Match reviewer
    SELECT id INTO v_instructor_id FROM public.instructors WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()) LIMIT 1;

    UPDATE public.parent_feedback
    SET 
        status = p_status,
        admin_notes = COALESCE(p_admin_notes, admin_notes),
        reviewed_at = CASE WHEN p_status IN ('reviewed', 'responded') AND reviewed_at IS NULL THEN timezone('utc'::text, now()) ELSE reviewed_at END,
        reviewed_by = COALESCE(reviewed_by, v_instructor_id),
        responded_at = CASE WHEN p_status = 'responded' THEN timezone('utc'::text, now()) ELSE responded_at END
    WHERE id = p_feedback_id;

    RETURN jsonb_build_object('success', true, 'status', p_status);
END;
$$;

-- ==============================================================================
-- 8.4 PUBLIC / PARENT VERIFICATION RPC (No Staff Login Required)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.verify_parent_access(
    p_token TEXT,
    p_pin TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_access RECORD;
    v_student RECORD;
    v_summary JSONB;
    v_recent_classes JSONB;
    v_pending_hw JSONB;
    v_completed_hw JSONB;
    v_month_start DATE;
    v_month_end DATE;
    v_total_classes INT;
    v_total_minutes INT;
    v_mtd_classes INT;
    v_mtd_minutes INT;
    v_completed_hw_count INT;
    v_pending_hw_count INT;
    v_last_update_date TEXT;
BEGIN
    -- 1. Look up active parent access token
    SELECT * INTO v_access
    FROM public.parent_access
    WHERE access_token = trim(p_token)
      AND active = true
    LIMIT 1;

    IF v_access.id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'This report link is inactive or invalid. Please contact your learning centre.'
        );
    END IF;

    -- 2. Check rate limit / lockout
    IF v_access.lockout_until IS NOT NULL AND v_access.lockout_until > timezone('utc'::text, now()) THEN
        RETURN jsonb_build_object(
            'success', false,
            'locked_out', true,
            'lockout_seconds', EXTRACT(EPOCH FROM (v_access.lockout_until - timezone('utc'::text, now())))::INT,
            'error', 'Too many incorrect attempts. Access temporarily locked. Please try again later.'
        );
    END IF;

    -- 3. Verify PIN hash
    IF v_access.pin_hash != extensions.crypt(trim(p_pin), v_access.pin_hash) THEN
        -- Increment failed attempts
        UPDATE public.parent_access
        SET 
            failed_attempts = failed_attempts + 1,
            lockout_until = CASE WHEN failed_attempts + 1 >= 5 THEN timezone('utc'::text, now()) + INTERVAL '15 minutes' ELSE NULL END,
            updated_at = timezone('utc'::text, now())
        WHERE id = v_access.id;

        RETURN jsonb_build_object(
            'success', false,
            'error', 'Incorrect PIN. Please check and try again.'
        );
    END IF;

    -- 4. Success: Reset failed attempts & record last access
    UPDATE public.parent_access
    SET 
        failed_attempts = 0,
        lockout_until = NULL,
        last_accessed_at = timezone('utc'::text, now())
    WHERE id = v_access.id;

    -- 5. Fetch student details
    SELECT * INTO v_student
    FROM public.students
    WHERE id = v_access.student_id;

    -- 6. Date ranges for monthly metrics
    v_month_start := date_trunc('month', timezone('utc'::text, now()))::DATE;
    v_month_end := (date_trunc('month', timezone('utc'::text, now())) + INTERVAL '1 month - 1 day')::DATE;

    -- Metrics
    SELECT COUNT(*), COALESCE(SUM(duration_minutes), 0)
    INTO v_total_classes, v_total_minutes
    FROM public.class_updates
    WHERE student_id = v_student.id;

    SELECT COUNT(*), COALESCE(SUM(duration_minutes), 0)
    INTO v_mtd_classes, v_mtd_minutes
    FROM public.class_updates
    WHERE student_id = v_student.id
      AND class_date >= v_month_start
      AND class_date <= v_month_end;

    SELECT COUNT(*) INTO v_completed_hw_count
    FROM public.homework
    WHERE student_id = v_student.id AND checked = true;

    SELECT COUNT(*) INTO v_pending_hw_count
    FROM public.homework
    WHERE student_id = v_student.id AND checked = false;

    SELECT TO_CHAR(MAX(class_date), 'DD Mon YYYY') INTO v_last_update_date
    FROM public.class_updates
    WHERE student_id = v_student.id;

    -- Recent classes (Up to 15 most recent)
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', cu.id,
            'class_date', cu.class_date,
            'duration_minutes', cu.duration_minutes,
            'booklet_number', cu.booklet_number,
            'english_level', cu.english_level,
            'btm_level', cu.btm_level,
            'ctm_level', cu.ctm_level,
            'cw', cu.cw,
            'hw', cu.hw,
            'subject', jsonb_build_object('name', sub.name),
            'instructor', jsonb_build_object('name', ins.name)
        ) ORDER BY cu.class_date DESC, cu.created_at DESC
    ) INTO v_recent_classes
    FROM (
        SELECT * FROM public.class_updates
        WHERE student_id = v_student.id
        ORDER BY class_date DESC
        LIMIT 15
    ) cu
    JOIN public.subjects sub ON sub.id = cu.subject_id
    JOIN public.instructors ins ON ins.id = cu.instructor_id;

    -- Pending homework
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', h.id,
            'assigned_date', h.assigned_date,
            'homework_text', h.homework_text,
            'checked', h.checked,
            'subject', jsonb_build_object('name', sub.name),
            'class_update', jsonb_build_object('booklet_number', cu.booklet_number)
        ) ORDER BY h.assigned_date DESC
    ) INTO v_pending_hw
    FROM public.homework h
    JOIN public.subjects sub ON sub.id = h.subject_id
    LEFT JOIN public.class_updates cu ON cu.id = h.class_update_id
    WHERE h.student_id = v_student.id
      AND h.checked = false;

    -- Completed homework (Up to 10 most recent)
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', h.id,
            'assigned_date', h.assigned_date,
            'checked_date', h.checked_date,
            'homework_text', h.homework_text,
            'checked', h.checked,
            'subject', jsonb_build_object('name', sub.name),
            'instructor', jsonb_build_object('name', ins.name),
            'class_update', jsonb_build_object('booklet_number', cu.booklet_number)
        ) ORDER BY h.checked_date DESC NULLS LAST, h.assigned_date DESC
    ) INTO v_completed_hw
    FROM (
        SELECT * FROM public.homework
        WHERE student_id = v_student.id AND checked = true
        ORDER BY checked_date DESC NULLS LAST, assigned_date DESC
        LIMIT 10
    ) h
    JOIN public.subjects sub ON sub.id = h.subject_id
    LEFT JOIN public.instructors ins ON ins.id = h.checked_by
    LEFT JOIN public.class_updates cu ON cu.id = h.class_update_id;

    RETURN jsonb_build_object(
        'success', true,
        'report', jsonb_build_object(
            'student', jsonb_build_object(
                'id', v_student.id,
                'name', v_student.name,
                'english_level', v_student.default_english_level,
                'btm_level', v_student.default_btm_level,
                'ctm_level', v_student.default_ctm_level
            ),
            'summary', jsonb_build_object(
                'classes_this_month', v_mtd_classes,
                'hours_this_month', ROUND((v_mtd_minutes::NUMERIC / 60.0), 1),
                'total_classes', v_total_classes,
                'total_hours', ROUND((v_total_minutes::NUMERIC / 60.0), 1),
                'homework_completed', v_completed_hw_count,
                'homework_pending', v_pending_hw_count
            ),
            'recent_classes', COALESCE(v_recent_classes, '[]'::jsonb),
            'pending_homework', COALESCE(v_pending_hw, '[]'::jsonb),
            'completed_homework', COALESCE(v_completed_hw, '[]'::jsonb),
            'last_updated', COALESCE(v_last_update_date, 'Recently')
        )
    );
END;
$$;

-- Submit Parent Feedback RPC
CREATE OR REPLACE FUNCTION public.submit_parent_feedback(
    p_token TEXT,
    p_pin TEXT,
    p_rating TEXT DEFAULT NULL,
    p_feedback_text TEXT DEFAULT NULL,
    p_contact_requested BOOLEAN DEFAULT false,
    p_contact_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_access RECORD;
BEGIN
    -- 1. Validate token & PIN
    SELECT * INTO v_access
    FROM public.parent_access
    WHERE access_token = trim(p_token)
      AND active = true
    LIMIT 1;

    IF v_access.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid or inactive report token.');
    END IF;

    IF v_access.pin_hash != extensions.crypt(trim(p_pin), v_access.pin_hash) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid PIN verification.');
    END IF;

    -- 2. Insert Feedback
    INSERT INTO public.parent_feedback (
        student_id,
        parent_access_id,
        rating,
        feedback_text,
        contact_requested,
        contact_reason,
        status,
        created_at
    ) VALUES (
        v_access.student_id,
        v_access.id,
        p_rating,
        p_feedback_text,
        COALESCE(p_contact_requested, false),
        p_contact_reason,
        'new',
        timezone('utc'::text, now())
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Thank you! Your feedback has been received by the learning centre.'
    );
END;
$$;

-- Grant public execute on parent RPCs
GRANT EXECUTE ON FUNCTION public.verify_parent_access(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.submit_parent_feedback(TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_generate_parent_access(UUID, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_change_parent_pin(UUID, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_toggle_parent_access(UUID, BOOLEAN) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_regenerate_parent_token(UUID, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_get_parent_access_list() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_get_parent_feedback_list() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_update_feedback_status(UUID, TEXT, TEXT) TO authenticated, service_role;

-- 8.5 Seed Initial Parent Access Links with default PIN '1234'
DO $$
DECLARE
    r RECORD;
    v_tok TEXT;
    v_pw TEXT;
BEGIN
    v_pw := extensions.crypt('1234', extensions.gen_salt('bf', 10));
    FOR r IN SELECT id, name FROM public.students LOOP
        v_tok := encode(gen_random_bytes(24), 'hex');
        INSERT INTO public.parent_access (student_id, access_token, pin_hash, active, created_at, updated_at)
        VALUES (r.id, v_tok, v_pw, true, timezone('utc'::text, now()), timezone('utc'::text, now()))
        ON CONFLICT (student_id) DO NOTHING;
    END LOOP;
END $$;

