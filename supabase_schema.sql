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
