-- ============================================================================
-- SPRING MONTESSORI SCHOOL — MANAGEMENT SYSTEM
-- Complete Database Schema for Supabase (PostgreSQL)
-- ============================================================================
-- School: Spring Montessori School
-- Type: Nigerian Primary (Primary 1-6) & Secondary (JSS1-3, SS1-3)
-- Tech: Next.js + Supabase + TypeScript
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- SECTION 1: ENUMS
-- ============================================================================

CREATE TYPE public.app_role AS ENUM (
  'super_admin',
  'school_admin',
  'teacher',
  'student_parent'
);

CREATE TYPE public.gender AS ENUM ('male', 'female');

CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late', 'excused');

CREATE TYPE public.attendance_method AS ENUM ('manual', 'qr_scan');

CREATE TYPE public.attendance_type AS ENUM ('student', 'staff');

CREATE TYPE public.exam_type AS ENUM ('mid_term', 'end_of_term');

CREATE TYPE public.question_type AS ENUM ('mcq', 'true_false', 'short_answer');

CREATE TYPE public.difficulty_level AS ENUM ('easy', 'medium', 'hard');

CREATE TYPE public.exam_status AS ENUM ('draft', 'published', 'closed', 'archived');

CREATE TYPE public.security_event_type AS ENUM (
  'tab_switch', 'window_blur', 'visibility_change',
  'navigation_attempt', 'exam_lock', 'exam_unlock'
);

CREATE TYPE public.sync_status AS ENUM ('pending', 'synced', 'failed');

CREATE TYPE public.attempt_status AS ENUM (
  'in_progress', 'submitted', 'auto_submitted', 'locked', 'synced'
);

CREATE TYPE public.result_status AS ENUM (
  'draft', 'pending_approval', 'approved', 'published'
);

CREATE TYPE public.scratch_card_status AS ENUM ('unused', 'active', 'exhausted');

CREATE TYPE public.payment_status AS ENUM ('pending', 'partial', 'paid', 'overpaid');

CREATE TYPE public.audit_action AS ENUM (
  'create', 'update', 'delete', 'view', 'approve', 'publish',
  'submit', 'generate', 'export', 'login', 'logout'
);

CREATE TYPE public.class_level AS ENUM (
  'primary_1', 'primary_2', 'primary_3', 'primary_4', 'primary_5', 'primary_6',
  'jss_1', 'jss_2', 'jss_3',
  'ss_1', 'ss_2', 'ss_3'
);

CREATE TYPE public.announcement_target AS ENUM (
  'all', 'class', 'students_parents', 'teachers_staff'
);

CREATE TYPE public.notification_type AS ENUM (
  'assignment', 'cbt', 'result', 'payment', 'announcement', 'admission', 'general'
);

CREATE TYPE public.email_event_type AS ENUM (
  'admission_received', 'admission_approved', 'account_created', 'password_reset',
  'fee_invoice', 'payment_confirmation', 'payment_reminder',
  'result_published', 'assignment_created', 'cbt_available', 'announcement_published'
);

CREATE TYPE public.email_status AS ENUM ('pending', 'sent', 'failed');

CREATE TYPE public.assignment_status AS ENUM ('draft', 'published', 'closed', 'archived');

CREATE TYPE public.timetable_type AS ENUM ('class', 'teacher', 'examination');

CREATE TYPE public.id_card_type AS ENUM ('student', 'staff');

CREATE TYPE public.day_of_week AS ENUM (
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
);

-- ============================================================================
-- SECTION 2: AUTH / RBAC TABLES
-- ============================================================================

-- Profiles: extends Supabase auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role public.app_role NOT NULL DEFAULT 'student_parent',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Permissions catalog
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,         -- e.g. 'students.create', 'cbt.manage'
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Role-permission mapping
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role public.app_role NOT NULL,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(role, permission_id)
);

-- ============================================================================
-- SECTION 3: SCHOOL CONFIGURATION
-- ============================================================================

CREATE TABLE public.school_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_name TEXT NOT NULL DEFAULT 'Spring Montessori School',
  school_motto TEXT,
  logo_url TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Nigeria',
  phone TEXT,
  email TEXT,
  website TEXT,
  current_session_id UUID,           -- FK added after academic_sessions created
  current_term_id UUID,              -- FK added after terms created
  grading_system JSONB DEFAULT '{}',
  result_config JSONB DEFAULT '{}',
  notification_preferences JSONB DEFAULT '{}',
  email_preferences JSONB DEFAULT '{}',
  calendar_config JSONB DEFAULT '{}',
  currency TEXT DEFAULT 'NGN',
  currency_symbol TEXT DEFAULT '₦',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 4: ACADEMIC STRUCTURE
-- ============================================================================

-- Academic Sessions (e.g., 2026/2027)
CREATE TABLE public.academic_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,          -- e.g. '2026/2027'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add FK now that academic_sessions exists
ALTER TABLE public.school_settings
  ADD CONSTRAINT fk_school_settings_current_session
  FOREIGN KEY (current_session_id) REFERENCES public.academic_sessions(id) ON DELETE SET NULL;

-- Terms (First, Second, Third)
CREATE TABLE public.terms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                 -- 'First Term', 'Second Term', 'Third Term'
  term_number INT NOT NULL CHECK (term_number BETWEEN 1 AND 3),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, term_number)
);

-- Add FK now that terms exists
ALTER TABLE public.school_settings
  ADD CONSTRAINT fk_school_settings_current_term
  FOREIGN KEY (current_term_id) REFERENCES public.terms(id) ON DELETE SET NULL;

-- Classes
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,                 -- e.g. 'JSS1 A'
  class_level public.class_level NOT NULL,
  arm TEXT,                           -- 'A', 'B', 'C'
  session_id UUID NOT NULL REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
  class_teacher_id UUID,              -- FK to staff, added later
  capacity INT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(name, session_id)
);

-- Subjects
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,          -- e.g. 'MATH', 'ENG'
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Class-Subject associations
CREATE TABLE public.class_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(class_id, subject_id)
);

-- ============================================================================
-- SECTION 5: STAFF
-- ============================================================================

CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  staff_id TEXT NOT NULL UNIQUE,      -- e.g. 'SMS/TCH/001'
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  gender public.gender,
  date_of_birth DATE,
  photo_url TEXT,
  address TEXT,
  department TEXT,
  role TEXT NOT NULL DEFAULT 'teacher',  -- 'teacher', 'admin', 'librarian', etc.
  app_role public.app_role NOT NULL DEFAULT 'teacher',
  qualification TEXT,
  employment_date DATE,
  employment_status TEXT DEFAULT 'active',
  is_active BOOLEAN NOT NULL DEFAULT true,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Teacher-Class assignments
CREATE TABLE public.teacher_classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  is_class_teacher BOOLEAN NOT NULL DEFAULT false,
  session_id UUID NOT NULL REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(staff_id, class_id, session_id)
);

-- Teacher-Subject assignments (linked to class)
CREATE TABLE public.teacher_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(staff_id, subject_id, class_id, session_id)
);

-- Add class_teacher FK
ALTER TABLE public.classes
  ADD CONSTRAINT fk_classes_class_teacher
  FOREIGN KEY (class_teacher_id) REFERENCES public.staff(id) ON DELETE SET NULL;

-- ============================================================================
-- SECTION 6: STUDENTS
-- ============================================================================

CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  student_id TEXT NOT NULL UNIQUE,    -- e.g. 'SMS/STU/001'
  admission_number TEXT UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  gender public.gender,
  date_of_birth DATE,
  photo_url TEXT,
  address TEXT,
  blood_group TEXT,
  genotype TEXT,
  state_of_origin TEXT,
  local_government TEXT,
  nationality TEXT DEFAULT 'Nigerian',
  religion TEXT,
  previous_school TEXT,
  admission_date DATE,
  admission_class_id UUID REFERENCES public.classes(id),
  status TEXT DEFAULT 'active',       -- 'active', 'graduated', 'transferred', 'suspended'
  is_active BOOLEAN NOT NULL DEFAULT true,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Families (parent/family accounts)
CREATE TABLE public.families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  family_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  alternate_phone TEXT,
  address TEXT,
  relationship TEXT,                  -- 'father', 'mother', 'guardian'
  occupation TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Family-Children linking (one family -> multiple students)
CREATE TABLE public.family_children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  relationship TEXT,                  -- 'son', 'daughter', 'ward'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(family_id, student_id)
);

-- Student Enrollments (class per session/term)
CREATE TABLE public.student_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active',       -- 'active', 'transferred_out', 'graduated'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, term_id)
);

-- ============================================================================
-- SECTION 7: ATTENDANCE
-- ============================================================================

CREATE TABLE public.attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID NOT NULL,
  person_type public.attendance_type NOT NULL,
  date DATE NOT NULL,
  time_in TIMESTAMPTZ,
  time_out TIMESTAMPTZ,
  status public.attendance_status NOT NULL,
  method public.attendance_method NOT NULL DEFAULT 'manual',
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.academic_sessions(id) ON DELETE SET NULL,
  term_id UUID REFERENCES public.terms(id) ON DELETE SET NULL,
  marked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(person_id, person_type, date)
);

CREATE TABLE public.qr_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID NOT NULL,
  person_type public.attendance_type NOT NULL,
  token TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 8: TIMETABLE
-- ============================================================================

CREATE TABLE public.timetables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timetable_type public.timetable_type NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  day public.day_of_week NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT,
  session_id UUID REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
  term_id UUID REFERENCES public.terms(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 9: PAYMENTS / FEES
-- ============================================================================

CREATE TABLE public.fee_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.fee_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES public.fee_categories(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  session_id UUID NOT NULL REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  due_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.student_fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  fee_item_id UUID NOT NULL REFERENCES public.fee_items(id) ON DELETE CASCADE,
  amount_due DECIMAL(12,2) NOT NULL,
  amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
  balance DECIMAL(12,2) GENERATED ALWAYS AS (amount_due - amount_paid) STORED,
  status public.payment_status NOT NULL DEFAULT 'pending',
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_fee_id UUID NOT NULL REFERENCES public.student_fees(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  payment_method TEXT,
  reference TEXT UNIQUE,
  receipt_number TEXT UNIQUE,
  paid_by TEXT,
  notes TEXT,
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 10: ASSIGNMENTS
-- ============================================================================

CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ,
  total_marks DECIMAL(6,2) DEFAULT 100,
  instructions TEXT,
  status public.assignment_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ,
  content TEXT,
  file_url TEXT,
  marks DECIMAL(6,2),
  feedback TEXT,
  is_late BOOLEAN NOT NULL DEFAULT false,
  status TEXT DEFAULT 'pending',
  graded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  graded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);

CREATE TABLE public.assignment_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 11: NOTES / LEARNING MATERIALS
-- ============================================================================

CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,
  topic TEXT,
  content TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.note_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 12: CBT — QUESTION BANK
-- ============================================================================

CREATE TABLE public.question_banks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_bank_id UUID NOT NULL REFERENCES public.question_banks(id) ON DELETE CASCADE,
  topic TEXT,
  question_text TEXT NOT NULL,
  question_type public.question_type NOT NULL,
  difficulty public.difficulty_level DEFAULT 'medium',
  marks DECIMAL(6,2) NOT NULL DEFAULT 1,
  explanation TEXT,
  correct_answer TEXT,
  time_limit_seconds INT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.question_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_label TEXT NOT NULL,          -- 'A', 'B', 'C', 'D'
  is_correct BOOLEAN NOT NULL DEFAULT false,
  position INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 13: CBT — EXAMINATIONS
-- ============================================================================

CREATE TABLE public.examinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,
  exam_type public.exam_type NOT NULL,
  duration_minutes INT NOT NULL,
  total_marks DECIMAL(6,2) NOT NULL,
  total_questions INT NOT NULL,
  instructions TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status public.exam_status NOT NULL DEFAULT 'draft',
  allow_question_shuffle BOOLEAN DEFAULT false,
  show_result_after_submit BOOLEAN DEFAULT true,
  unlock_code TEXT,                     -- server-side validated code for unlocking
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Links exams to specific questions
CREATE TABLE public.examination_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  examination_id UUID NOT NULL REFERENCES public.examinations(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  position INT NOT NULL,
  marks_override DECIMAL(6,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(examination_id, question_id)
);

-- ============================================================================
-- SECTION 14: CBT — ATTEMPTS & ANSWERS
-- ============================================================================

CREATE TABLE public.examination_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unique_id TEXT NOT NULL UNIQUE,       -- idempotency key: e.g. 'EXAM-2026-00192'
  examination_id UUID NOT NULL REFERENCES public.examinations(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  attempt_number INT NOT NULL DEFAULT 1,
  status public.attempt_status NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  score DECIMAL(6,2),
  total_marks DECIMAL(6,2),
  percentage DECIMAL(5,2),
  time_spent_seconds INT,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  locked_at TIMESTAMPTZ,
  locked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  unlocked_at TIMESTAMPTZ,
  unlocked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sync_status public.sync_status NOT NULL DEFAULT 'pending',
  local_data JSONB,                     -- local CBT data for recovery
  integrity_hash TEXT,                  -- cryptographic integrity signature
  source TEXT DEFAULT 'cbt',            -- 'cbt' or 'manual'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(examination_id, student_id, attempt_number)
);

CREATE TABLE public.examination_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES public.examination_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_option_id UUID REFERENCES public.question_options(id) ON DELETE SET NULL,
  answer_text TEXT,                     -- for short_answer
  is_correct BOOLEAN,
  marks_awarded DECIMAL(6,2),
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(attempt_id, question_id)
);

-- ============================================================================
-- SECTION 15: CBT — SECURITY & SYNC
-- ============================================================================

CREATE TABLE public.exam_security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES public.examination_attempts(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  examination_id UUID NOT NULL REFERENCES public.examinations(id) ON DELETE CASCADE,
  event_type public.security_event_type NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.exam_sync_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES public.examination_attempts(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL,              -- 'answer_save', 'attempt_submit', 'local_upload'
  status public.sync_status NOT NULL DEFAULT 'pending',
  payload_hash TEXT,
  retry_count INT DEFAULT 0,
  last_synced_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 16: RESULTS — CONFIGURATION
-- ============================================================================

CREATE TABLE public.result_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  grading_scale JSONB NOT NULL DEFAULT '[]',
  pass_mark DECIMAL(5,2) DEFAULT 40,
  ranking_enabled BOOLEAN DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.result_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  result_configuration_id UUID NOT NULL REFERENCES public.result_configurations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                   -- 'CA', 'Mid-Term', 'End-Term'
  code TEXT NOT NULL,                   -- 'ca', 'mid_term', 'end_term'
  max_marks DECIMAL(6,2) NOT NULL,
  weight_percentage DECIMAL(5,2) NOT NULL,
  contributes_to_final BOOLEAN NOT NULL DEFAULT true,
  position INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(result_configuration_id, code)
);

-- ============================================================================
-- SECTION 17: RESULTS — STUDENT RESULTS
-- ============================================================================

CREATE TABLE public.student_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,
  result_configuration_id UUID REFERENCES public.result_configurations(id) ON DELETE SET NULL,
  total_score DECIMAL(6,2),
  percentage DECIMAL(5,2),
  grade TEXT,
  remark TEXT,
  position INT,
  status public.result_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, subject_id, term_id)
);

CREATE TABLE public.student_result_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_result_id UUID NOT NULL REFERENCES public.student_results(id) ON DELETE CASCADE,
  component_code TEXT NOT NULL,         -- 'ca', 'mid_term', 'end_term'
  component_name TEXT NOT NULL,
  score DECIMAL(6,2),
  max_marks DECIMAL(6,2) NOT NULL,
  weight_percentage DECIMAL(5,2),
  weighted_score DECIMAL(6,2),
  source TEXT DEFAULT 'manual',         -- 'cbt', 'manual'
  examination_attempt_id UUID REFERENCES public.examination_attempts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_result_id, component_code)
);

CREATE TABLE public.result_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_result_id UUID NOT NULL REFERENCES public.student_results(id) ON DELETE CASCADE,
  action TEXT NOT NULL,                 -- 'submitted', 'approved', 'rejected', 'published'
  acted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 18: SCRATCH CARDS
-- ============================================================================

CREATE TABLE public.result_scratch_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,
  card_code TEXT NOT NULL UNIQUE,
  pin TEXT NOT NULL,
  max_attempts INT NOT NULL DEFAULT 5,
  remaining_attempts INT NOT NULL DEFAULT 5,
  status public.scratch_card_status NOT NULL DEFAULT 'unused',
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.result_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scratch_card_id UUID NOT NULL REFERENCES public.result_scratch_cards(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  attempt_number INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'success',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 19: ID CARDS
-- ============================================================================

CREATE TABLE public.id_card_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  card_type public.id_card_type NOT NULL,
  front_design JSONB NOT NULL DEFAULT '{}',
  back_design JSONB DEFAULT '{}',
  logo_url TEXT,
  background_url TEXT,
  primary_color TEXT DEFAULT '#1a56db',
  secondary_color TEXT DEFAULT '#ffffff',
  font_family TEXT DEFAULT 'Inter, sans-serif',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.id_card_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES public.id_card_templates(id) ON DELETE CASCADE,
  person_id UUID NOT NULL,              -- student_id or staff_id
  person_type public.id_card_type NOT NULL,
  card_data JSONB NOT NULL DEFAULT '{}',
  pdf_url TEXT,
  qr_code_url TEXT,
  session_id UUID REFERENCES public.academic_sessions(id) ON DELETE SET NULL,
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 20: COMMUNICATION — ANNOUNCEMENTS
-- ============================================================================

CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target public.announcement_target NOT NULL DEFAULT 'all',
  target_class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  publish_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  expiry_date TIMESTAMPTZ,
  is_published BOOLEAN NOT NULL DEFAULT false,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 21: COMMUNICATION — NOTIFICATIONS
-- ============================================================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 22: EMAIL AUTOMATION
-- ============================================================================

CREATE TABLE public.email_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type public.email_event_type NOT NULL,
  template_slug TEXT NOT NULL,
  subject TEXT NOT NULL,
  recipient_role public.app_role,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.email_events(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  template_slug TEXT,
  status public.email_status NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  resend_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 23: AUDIT LOGS
-- ============================================================================

-- Normal school audit log (excludes Super Admin actions)
CREATE TABLE public.school_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_role public.app_role NOT NULL,
  action public.audit_action NOT NULL,
  entity_type TEXT NOT NULL,            -- 'student', 'staff', 'result', etc.
  entity_id UUID,
  entity_description TEXT,
  previous_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Separate system security log for Super Admin actions
CREATE TABLE public.system_security_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 24: CMS — PUBLIC WEBSITE CONTENT
-- ============================================================================

CREATE TABLE public.cms_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,            -- 'about', 'academics', 'admission'
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  seo_title TEXT,
  seo_description TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.cms_news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.cms_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  featured_image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.cms_gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT,
  position INT DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.online_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  student_name TEXT NOT NULL,
  student_dob DATE,
  student_gender public.gender,
  applying_class public.class_level,
  parent_name TEXT,
  parent_phone TEXT,
  parent_email TEXT,
  address TEXT,
  previous_school TEXT,
  additional_info TEXT,
  documents JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending',        -- 'pending', 'reviewed', 'approved', 'rejected'
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 25: DATABASE FUNCTIONS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'student_parent')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Audit log function (excludes super_admin from school audit log)
CREATE OR REPLACE FUNCTION public.log_audit(
  p_user_id UUID,
  p_user_role public.app_role,
  p_action public.audit_action,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_entity_description TEXT DEFAULT NULL,
  p_previous_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Super Admin actions go to system_security_logs, NOT school_audit_logs
  IF p_user_role = 'super_admin' THEN
    INSERT INTO public.system_security_logs (user_id, action, entity_type, entity_id, details)
    VALUES (p_user_id, p_action::TEXT, p_entity_type, p_entity_id, 
            jsonb_build_object('previous', p_previous_values, 'new', p_new_values) || COALESCE(p_metadata, '{}'));
  ELSE
    INSERT INTO public.school_audit_logs (user_id, user_role, action, entity_type, entity_id, entity_description, previous_values, new_values, metadata)
    VALUES (p_user_id, p_user_role, p_action, p_entity_type, p_entity_id, p_entity_description, p_previous_values, p_new_values, COALESCE(p_metadata, '{}'));
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic scratch card attempt deduction
CREATE OR REPLACE FUNCTION public.consume_scratch_card_attempt(p_card_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_remaining INT;
  v_status public.scratch_card_status;
  v_card RECORD;
BEGIN
  -- Lock the row for atomic update
  SELECT id, remaining_attempts, status, student_id, session_id, term_id
  INTO v_card
  FROM public.result_scratch_cards
  WHERE id = p_card_id
  FOR UPDATE;

  IF v_card IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Card not found');
  END IF;

  IF v_card.status = 'exhausted' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Card is exhausted');
  END IF;

  IF v_card.remaining_attempts <= 0 THEN
    UPDATE public.result_scratch_cards
    SET status = 'exhausted', updated_at = now()
    WHERE id = p_card_id;
    RETURN jsonb_build_object('success', false, 'error', 'No attempts remaining');
  END IF;

  -- Atomically decrement
  UPDATE public.result_scratch_cards
  SET remaining_attempts = remaining_attempts - 1,
      status = CASE WHEN remaining_attempts - 1 = 0 THEN 'exhausted' ELSE 'active' END,
      activated_at = COALESCE(activated_at, now()),
      updated_at = now()
  WHERE id = p_card_id
  RETURNING remaining_attempts, status INTO v_remaining, v_status;

  RETURN jsonb_build_object(
    'success', true,
    'remaining_attempts', v_remaining,
    'status', v_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Idempotent CBT submission function
CREATE OR REPLACE FUNCTION public.submit_cbt_attempt(
  p_attempt_id UUID,
  p_score DECIMAL,
  p_total_marks DECIMAL
)
RETURNS JSONB AS $$
DECLARE
  v_attempt RECORD;
  v_percentage DECIMAL;
BEGIN
  SELECT id, status, examination_id, student_id
  INTO v_attempt
  FROM public.examination_attempts
  WHERE id = p_attempt_id
  FOR UPDATE;

  IF v_attempt IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Attempt not found');
  END IF;

  -- Idempotent: if already submitted, return existing result
  IF v_attempt.status IN ('submitted', 'synced') THEN
    RETURN jsonb_build_object(
      'success', true,
      'already_submitted', true,
      'score', v_attempt.score,
      'total_marks', v_attempt.total_marks,
      'percentage', v_attempt.percentage
    );
  END IF;

  IF v_attempt.is_locked THEN
    RETURN jsonb_build_object('success', false, 'error', 'Exam is locked');
  END IF;

  v_percentage := CASE WHEN p_total_marks > 0 THEN (p_score / p_total_marks * 100) ELSE 0 END;

  UPDATE public.examination_attempts
  SET status = 'submitted',
      score = p_score,
      total_marks = p_total_marks,
      percentage = v_percentage,
      submitted_at = now(),
      sync_status = 'synced',
      updated_at = now()
  WHERE id = p_attempt_id;

  -- Auto-create/update student result
  INSERT INTO public.student_results (student_id, subject_id, class_id, session_id, term_id, total_score, percentage, status)
  SELECT v_attempt.student_id, e.subject_id, e.class_id, e.session_id, e.term_id,
         p_score, v_percentage, 'draft'
  FROM public.examinations e WHERE e.id = v_attempt.examination_id
  ON CONFLICT (student_id, subject_id, term_id)
  DO UPDATE SET total_score = p_score, percentage = v_percentage, updated_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'already_submitted', false,
    'score', p_score,
    'total_marks', p_total_marks,
    'percentage', v_percentage
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exam unlock validation function
CREATE OR REPLACE FUNCTION public.unlock_exam(
  p_attempt_id UUID,
  p_unlock_code TEXT,
  p_staff_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_attempt RECORD;
  v_exam_code TEXT;
  v_staff_id UUID;
BEGIN
  SELECT ea.id, ea.examination_id, ea.is_locked, ea.status
  INTO v_attempt
  FROM public.examination_attempts ea
  WHERE ea.id = p_attempt_id
  FOR UPDATE;

  IF v_attempt IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Attempt not found');
  END IF;

  IF NOT v_attempt.is_locked THEN
    RETURN jsonb_build_object('success', true, 'already_unlocked', true);
  END IF;

  SELECT e.unlock_code INTO v_exam_code
  FROM public.examinations e WHERE e.id = v_attempt.examination_id;

  IF v_exam_code IS NULL OR v_exam_code != p_unlock_code THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid unlock code');
  END IF;

  -- Verify staff authorization
  SELECT s.id INTO v_staff_id
  FROM public.staff s
  WHERE s.user_id = p_staff_user_id AND s.is_active = true;

  IF v_staff_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: not a valid staff member');
  END IF;

  UPDATE public.examination_attempts
  SET is_locked = false,
      unlocked_at = now(),
      unlocked_by = p_staff_user_id,
      updated_at = now()
  WHERE id = p_attempt_id;

  -- Log security event
  INSERT INTO public.exam_security_events (attempt_id, student_id, examination_id, event_type, metadata)
  VALUES (v_attempt.id, (SELECT student_id FROM public.examination_attempts WHERE id = p_attempt_id),
          v_attempt.examination_id, 'exam_unlock',
          jsonb_build_object('unlocked_by', p_staff_user_id, 'unlocked_at', now()));

  RETURN jsonb_build_object('success', true, 'unlocked', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user role helper
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS public.app_role AS $$
DECLARE
  v_role public.app_role;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = p_user_id;
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is teacher with class access
CREATE OR REPLACE FUNCTION public.is_teacher_of_class(p_user_id UUID, p_class_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_staff_id UUID;
  v_count INT;
BEGIN
  SELECT s.id INTO v_staff_id FROM public.staff s WHERE s.user_id = p_user_id;
  IF v_staff_id IS NULL THEN RETURN false; END IF;

  SELECT COUNT(*) INTO v_count
  FROM public.teacher_classes tc
  WHERE tc.staff_id = v_staff_id AND tc.class_id = p_class_id;

  RETURN v_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is teacher of subject in class
CREATE OR REPLACE FUNCTION public.is_teacher_of_subject_in_class(p_user_id UUID, p_subject_id UUID, p_class_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_staff_id UUID;
  v_count INT;
BEGIN
  SELECT s.id INTO v_staff_id FROM public.staff s WHERE s.user_id = p_user_id;
  IF v_staff_id IS NULL THEN RETURN false; END IF;

  SELECT COUNT(*) INTO v_count
  FROM public.teacher_subjects ts
  WHERE ts.staff_id = v_staff_id AND ts.subject_id = p_subject_id AND ts.class_id = p_class_id;

  RETURN v_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if student is parent's child
CREATE OR REPLACE FUNCTION public.is_parent_of_student(p_user_id UUID, p_student_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_family_id UUID;
  v_count INT;
BEGIN
  SELECT f.id INTO v_family_id
  FROM public.families f WHERE f.user_id = p_user_id;
  IF v_family_id IS NULL THEN RETURN false; END IF;

  SELECT COUNT(*) INTO v_count
  FROM public.family_children fc
  WHERE fc.family_id = v_family_id AND fc.student_id = p_student_id;

  RETURN v_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- SECTION 26: ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examination_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examination_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_result_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.result_scratch_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.result_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.id_card_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.id_card_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_gallery ENABLE ROW LEVEL SECURITY;

-- ---- PROFILES ----
-- Users can read their own profile; admins can read all
DO $$ BEGIN
  -- Profiles: select
  DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
  CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

  DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
  CREATE POLICY "profiles_select_admin" ON public.profiles
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin'))
    );

  -- Profiles: update own
  DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
  CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

  -- Profiles: admins can manage all
  DROP POLICY IF EXISTS "profiles_manage_admin" ON public.profiles;
  CREATE POLICY "profiles_manage_admin" ON public.profiles
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin'))
    );
END $$;

-- ---- STUDENTS ----
DO $$ BEGIN
  -- Super admin / school admin: full access
  DROP POLICY IF EXISTS "students_admin_all" ON public.students;
  CREATE POLICY "students_admin_all" ON public.students
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin'))
    );

  -- Teacher: only students in assigned classes
  DROP POLICY IF EXISTS "students_teacher_scope" ON public.students;
  CREATE POLICY "students_teacher_scope" ON public.students
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.staff s
        JOIN public.teacher_classes tc ON tc.staff_id = s.id
        JOIN public.student_enrollments se ON se.class_id = tc.class_id
        WHERE s.user_id = auth.uid() AND se.student_id = students.id
        AND tc.session_id = se.session_id
      )
    );

  -- Student: own record only
  DROP POLICY IF EXISTS "students_own_record" ON public.students;
  CREATE POLICY "students_own_record" ON public.students
    FOR SELECT USING (user_id = auth.uid());

  -- Parent: linked children only
  DROP POLICY IF EXISTS "students_parent_children" ON public.students;
  CREATE POLICY "students_parent_children" ON public.students
    FOR SELECT USING (
      public.is_parent_of_student(auth.uid(), students.id)
    );
END $$;

-- ---- STAFF ----
DO $$ BEGIN
  DROP POLICY IF EXISTS "staff_admin_all" ON public.staff;
  CREATE POLICY "staff_admin_all" ON public.staff
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin'))
    );

  DROP POLICY IF EXISTS "staff_teacher_own" ON public.staff;
  CREATE POLICY "staff_teacher_own" ON public.staff
    FOR SELECT USING (user_id = auth.uid());

  -- Staff can see other active staff (for collaboration)
  DROP POLICY IF EXISTS "staff_see_active" ON public.staff;
  CREATE POLICY "staff_see_active" ON public.staff
    FOR SELECT USING (is_active = true);
END $$;

-- ---- CLASSES ----
DO $$ BEGIN
  DROP POLICY IF EXISTS "classes_admin_all" ON public.classes;
  CREATE POLICY "classes_admin_all" ON public.classes
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin'))
    );

  -- Teachers can see classes they are assigned to
  DROP POLICY IF EXISTS "classes_teacher_scope" ON public.classes;
  CREATE POLICY "classes_teacher_scope" ON public.classes
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.teacher_classes tc
        JOIN public.staff s ON s.id = tc.staff_id
        WHERE s.user_id = auth.uid() AND tc.class_id = classes.id
      )
    );

  -- Students/parents can see classes they are enrolled in
  DROP POLICY IF EXISTS "classes_student_enrolled" ON public.classes;
  CREATE POLICY "classes_student_enrolled" ON public.classes
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.student_enrollments se
        JOIN public.students st ON st.id = se.student_id
        WHERE se.class_id = classes.id AND st.user_id = auth.uid()
      )
      OR public.is_parent_of_student(auth.uid(), 
        (SELECT student_id FROM public.student_enrollments WHERE class_id = classes.id LIMIT 1))
    );
END $$;

-- ---- ASSIGNMENTS ----
DO $$ BEGIN
  DROP POLICY IF EXISTS "assignments_admin_all" ON public.assignments;
  CREATE POLICY "assignments_admin_all" ON public.assignments
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin'))
    );

  -- Teachers: only their assigned class/subject
  DROP POLICY IF EXISTS "assignments_teacher_scope" ON public.assignments;
  CREATE POLICY "assignments_teacher_scope" ON public.assignments
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.staff s
        JOIN public.teacher_subjects ts ON ts.staff_id = s.id
        WHERE s.user_id = auth.uid()
        AND ts.class_id = assignments.class_id
        AND ts.subject_id = assignments.subject_id
      )
    );

  DROP POLICY IF EXISTS "assignments_teacher_create" ON public.assignments;
  CREATE POLICY "assignments_teacher_create" ON public.assignments
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.staff s
        JOIN public.teacher_subjects ts ON ts.staff_id = s.id
        WHERE s.user_id = auth.uid()
        AND ts.class_id = class_id AND ts.subject_id = subject_id
      )
    );

  -- Students: see published assignments for their class
  DROP POLICY IF EXISTS "assignments_student_view" ON public.assignments;
  CREATE POLICY "assignments_student_view" ON public.assignments
    FOR SELECT USING (
      status = 'published' AND
      EXISTS (
        SELECT 1 FROM public.student_enrollments se
        JOIN public.students st ON st.id = se.student_id
        WHERE se.class_id = assignments.class_id
        AND (st.user_id = auth.uid() OR public.is_parent_of_student(auth.uid(), st.id))
      )
    );
END $$;

-- ---- EXAMINATION ATTEMPTS ----
DO $$ BEGIN
  -- Students: own attempts only
  DROP POLICY IF EXISTS "exam_attempts_own" ON public.examination_attempts;
  CREATE POLICY "exam_attempts_own" ON public.examination_attempts
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.students WHERE students.id = examination_attempts.student_id AND students.user_id = auth.uid())
      OR public.is_parent_of_student(auth.uid(), examination_attempts.student_id)
    );

  -- Teachers: attempts for their exams
  DROP POLICY IF EXISTS "exam_attempts_teacher" ON public.examination_attempts;
  CREATE POLICY "exam_attempts_teacher" ON public.examination_attempts
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.examinations e
        JOIN public.staff s ON s.id = e.created_by
        WHERE e.id = examination_attempts.examination_id
        AND s.user_id = auth.uid()
      )
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin'))
    );

  -- Admin: all
  DROP POLICY IF EXISTS "exam_attempts_admin" ON public.examination_attempts;
  CREATE POLICY "exam_attempts_admin" ON public.examination_attempts
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin'))
    );
END $$;

-- ---- STUDENT RESULTS ----
DO $$ BEGIN
  DROP POLICY IF EXISTS "results_admin_all" ON public.student_results;
  CREATE POLICY "results_admin_all" ON public.student_results
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin'))
    );

  DROP POLICY IF EXISTS "results_teacher_scope" ON public.student_results;
  CREATE POLICY "results_teacher_scope" ON public.student_results
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.staff s
        JOIN public.teacher_subjects ts ON ts.staff_id = s.id
        WHERE s.user_id = auth.uid()
        AND ts.class_id = student_results.class_id
        AND ts.subject_id = student_results.subject_id
      )
    );

  DROP POLICY IF EXISTS "results_student_own" ON public.student_results;
  CREATE POLICY "results_student_own" ON public.student_results
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.students WHERE students.id = student_results.student_id AND students.user_id = auth.uid())
      OR public.is_parent_of_student(auth.uid(), student_results.student_id)
    );
END $$;

-- ---- SCRATCH CARDS (Super Admin only for management) ----
DO $$ BEGIN
  DROP POLICY IF EXISTS "scratch_cards_super_admin" ON public.result_scratch_cards;
  CREATE POLICY "scratch_cards_super_admin" ON public.result_scratch_cards
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
    );

  -- Students can see their own active card (not the pin)
  DROP POLICY IF EXISTS "scratch_cards_student_view" ON public.result_scratch_cards;
  CREATE POLICY "scratch_cards_student_view" ON public.result_scratch_cards
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.students WHERE students.id = result_scratch_cards.student_id AND students.user_id = auth.uid())
      OR public.is_parent_of_student(auth.uid(), result_scratch_cards.student_id)
    );
END $$;

-- ---- ID CARDS (Super Admin only) ----
DO $$ BEGIN
  DROP POLICY IF EXISTS "id_cards_super_admin" ON public.id_card_templates;
  CREATE POLICY "id_cards_super_admin" ON public.id_card_templates
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
    );

  DROP POLICY IF EXISTS "id_generations_super_admin" ON public.id_card_generations;
  CREATE POLICY "id_generations_super_admin" ON public.id_card_generations
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
    );
END $$;

-- ---- NOTIFICATIONS ----
DO $$ BEGIN
  DROP POLICY IF EXISTS "notifications_own" ON public.notifications;
  CREATE POLICY "notifications_own" ON public.notifications
    FOR ALL USING (user_id = auth.uid());
END $$;

-- ---- AUDIT LOGS ----
DO $$ BEGIN
  -- School audit logs: admins can read, super_admin excluded from this table
  DROP POLICY IF EXISTS "audit_logs_admin" ON public.school_audit_logs;
  CREATE POLICY "audit_logs_admin" ON public.school_audit_logs
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin'))
    );

  -- System security logs: super_admin only
  DROP POLICY IF EXISTS "system_logs_super_admin" ON public.system_security_logs;
  CREATE POLICY "system_logs_super_admin" ON public.system_security_logs
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
    );
END $$;

-- ---- ATTENDANCE ----
DO $$ BEGIN
  DROP POLICY IF EXISTS "attendance_admin_all" ON public.attendance_records;
  CREATE POLICY "attendance_admin_all" ON public.attendance_records
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin'))
    );

  DROP POLICY IF EXISTS "attendance_teacher_scope" ON public.attendance_records;
  CREATE POLICY "attendance_teacher_scope" ON public.attendance_records
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.staff s
        JOIN public.teacher_classes tc ON tc.staff_id = s.id
        WHERE s.user_id = auth.uid() AND tc.class_id = attendance_records.class_id
      )
    );

  DROP POLICY IF EXISTS "attendance_student_own" ON public.attendance_records;
  CREATE POLICY "attendance_student_own" ON public.attendance_records
    FOR SELECT USING (
      (person_type = 'student' AND EXISTS (SELECT 1 FROM public.students WHERE id = person_id AND user_id = auth.uid()))
      OR public.is_parent_of_student(auth.uid(), person_id)
    );
END $$;

-- ---- CMS (public read, admin write) ----
DO $$ BEGIN
  DROP POLICY IF EXISTS "cms_public_read" ON public.cms_pages;
  CREATE POLICY "cms_public_read" ON public.cms_pages
    FOR SELECT USING (is_published = true OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    ));

  DROP POLICY IF EXISTS "cms_admin_write" ON public.cms_pages;
  CREATE POLICY "cms_admin_write" ON public.cms_pages
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin'))
    );

  DROP POLICY IF EXISTS "news_public_read" ON public.cms_news;
  CREATE POLICY "news_public_read" ON public.cms_news
    FOR SELECT USING (is_published = true OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    ));

  DROP POLICY IF EXISTS "news_admin_write" ON public.cms_news;
  CREATE POLICY "news_admin_write" ON public.cms_news
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin'))
    );

  DROP POLICY IF EXISTS "events_public_read" ON public.cms_events;
  CREATE POLICY "events_public_read" ON public.cms_events
    FOR SELECT USING (is_published = true OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    ));

  DROP POLICY IF EXISTS "events_admin_write" ON public.cms_events;
  CREATE POLICY "events_admin_write" ON public.cms_events
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin'))
    );

  DROP POLICY IF EXISTS "gallery_public_read" ON public.cms_gallery;
  CREATE POLICY "gallery_public_read" ON public.cms_gallery
    FOR SELECT USING (is_published = true OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    ));

  DROP POLICY IF EXISTS "gallery_admin_write" ON public.cms_gallery;
  CREATE POLICY "gallery_admin_write" ON public.cms_gallery
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin'))
    );

  -- Online applications: public can insert, admin can manage all
  DROP POLICY IF EXISTS "applications_public_insert" ON public.online_applications;
  CREATE POLICY "applications_public_insert" ON public.online_applications
    FOR INSERT WITH CHECK (true);

  DROP POLICY IF EXISTS "applications_admin" ON public.online_applications;
  CREATE POLICY "applications_admin" ON public.online_applications
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin'))
    );
END $$;

-- ---- SCHOOL SETTINGS (public read, admin write) ----
DO $$ BEGIN
  DROP POLICY IF EXISTS "settings_public_read" ON public.school_settings;
  CREATE POLICY "settings_public_read" ON public.school_settings
    FOR SELECT USING (true);

  DROP POLICY IF EXISTS "settings_admin_write" ON public.school_settings;
  CREATE POLICY "settings_admin_write" ON public.school_settings
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin'))
    );
END $$;

-- ---- ACADEMIC SESSIONS & TERMS (public read, admin write) ----
DO $$ BEGIN
  DROP POLICY IF EXISTS "sessions_public_read" ON public.academic_sessions;
  CREATE POLICY "sessions_public_read" ON public.academic_sessions
    FOR SELECT USING (true);

  DROP POLICY IF EXISTS "sessions_admin_write" ON public.academic_sessions;
  CREATE POLICY "sessions_admin_write" ON public.academic_sessions
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin'))
    );

  DROP POLICY IF EXISTS "terms_public_read" ON public.terms;
  CREATE POLICY "terms_public_read" ON public.terms
    FOR SELECT USING (true);

  DROP POLICY IF EXISTS "terms_admin_write" ON public.terms;
  CREATE POLICY "terms_admin_write" ON public.terms
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin'))
    );
END $$;

-- ============================================================================
-- SECTION 27: INDEXES
-- ============================================================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Students
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_full_name ON public.students(full_name);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_students_deleted_at ON public.students(deleted_at);

-- Staff
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON public.staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_full_name ON public.staff(full_name);
CREATE INDEX IF NOT EXISTS idx_staff_role ON public.staff(role);
CREATE INDEX IF NOT EXISTS idx_staff_deleted_at ON public.staff(deleted_at);

-- Classes
CREATE INDEX IF NOT EXISTS idx_classes_session ON public.classes(session_id);
CREATE INDEX IF NOT EXISTS idx_classes_level ON public.classes(class_level);

-- Student Enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.student_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class ON public.student_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_session ON public.student_enrollments(session_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_term ON public.student_enrollments(term_id);

-- Teacher assignments
CREATE INDEX IF NOT EXISTS idx_teacher_classes_staff ON public.teacher_classes(staff_id);
CREATE INDEX IF NOT EXISTS idx_teacher_classes_class ON public.teacher_classes(class_id);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_staff ON public.teacher_subjects(staff_id);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_class ON public.teacher_subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_subject ON public.teacher_subjects(subject_id);

-- Attendance
CREATE INDEX IF NOT EXISTS idx_attendance_person ON public.attendance_records(person_id, person_type);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_class ON public.attendance_records(class_id);

-- Timetable
CREATE INDEX IF NOT EXISTS idx_timetable_class ON public.timetables(class_id);
CREATE INDEX IF NOT EXISTS idx_timetable_staff ON public.timetables(staff_id);

-- Payments
CREATE INDEX IF NOT EXISTS idx_student_fees_student ON public.student_fees(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_student_fee ON public.payments(student_fee_id);

-- Assignments
CREATE INDEX IF NOT EXISTS idx_assignments_class ON public.assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_subject ON public.assignments(subject_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher ON public.assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON public.assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_deleted_at ON public.assignments(deleted_at);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment ON public.assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student ON public.assignment_submissions(student_id);

-- Notes
CREATE INDEX IF NOT EXISTS idx_notes_class ON public.notes(class_id);
CREATE INDEX IF NOT EXISTS idx_notes_subject ON public.notes(subject_id);
CREATE INDEX IF NOT EXISTS idx_notes_deleted_at ON public.notes(deleted_at);

-- Question Bank
CREATE INDEX IF NOT EXISTS idx_questions_bank ON public.questions(question_bank_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON public.questions(topic);
CREATE INDEX IF NOT EXISTS idx_question_options_question ON public.question_options(question_id);

-- Examinations
CREATE INDEX IF NOT EXISTS idx_examinations_class ON public.examinations(class_id);
CREATE INDEX IF NOT EXISTS idx_examinations_subject ON public.examinations(subject_id);
CREATE INDEX IF NOT EXISTS idx_examinations_status ON public.examinations(status);
CREATE INDEX IF NOT EXISTS idx_examinations_type ON public.examinations(exam_type);
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam ON public.examination_questions(examination_id);

-- Exam Attempts
CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam ON public.examination_attempts(examination_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_student ON public.examination_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_unique ON public.examination_attempts(unique_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_status ON public.examination_attempts(status);
CREATE INDEX IF NOT EXISTS idx_exam_answers_attempt ON public.examination_answers(attempt_id);

-- Security Events
CREATE INDEX IF NOT EXISTS idx_security_events_attempt ON public.exam_security_events(attempt_id);
CREATE INDEX IF NOT EXISTS idx_security_events_student ON public.exam_security_events(student_id);

-- Results
CREATE INDEX IF NOT EXISTS idx_student_results_student ON public.student_results(student_id);
CREATE INDEX IF NOT EXISTS idx_student_results_subject ON public.student_results(subject_id);
CREATE INDEX IF NOT EXISTS idx_student_results_term ON public.student_results(term_id);
CREATE INDEX IF NOT EXISTS idx_student_results_status ON public.student_results(status);
CREATE INDEX IF NOT EXISTS idx_result_items_result ON public.student_result_items(student_result_id);

-- Scratch Cards
CREATE INDEX IF NOT EXISTS idx_scratch_cards_student ON public.result_scratch_cards(student_id);
CREATE INDEX IF NOT EXISTS idx_scratch_cards_status ON public.result_scratch_cards(status);
CREATE INDEX IF NOT EXISTS idx_access_logs_card ON public.result_access_logs(scratch_card_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_student ON public.result_access_logs(student_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);

-- Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.school_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.school_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.school_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.school_audit_logs(created_at);

-- CMS
CREATE INDEX IF NOT EXISTS idx_cms_news_published ON public.cms_news(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_cms_events_dates ON public.cms_events(start_date, end_date);

-- Announcements
CREATE INDEX IF NOT EXISTS idx_announcements_published ON public.announcements(is_published, publish_date);

-- Families
CREATE INDEX IF NOT EXISTS idx_families_user ON public.families(user_id);
CREATE INDEX IF NOT EXISTS idx_family_children_family ON public.family_children(family_id);
CREATE INDEX IF NOT EXISTS idx_family_children_student ON public.family_children(student_id);

-- QR Tokens
CREATE INDEX IF NOT EXISTS idx_qr_tokens_person ON public.qr_tokens(person_id, person_type);

-- ============================================================================
-- SECTION 28: UPDATED_AT TRIGGERS
-- ============================================================================

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.school_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.academic_sessions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.terms FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.families FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.student_enrollments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.attendance_records FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.timetables FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.fee_categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.fee_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.student_fees FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.assignment_submissions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.question_banks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.examinations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.examination_attempts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.student_results FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.student_result_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.result_scratch_cards FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.id_card_templates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.cms_pages FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.cms_news FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.cms_events FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.online_applications FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- SECTION 29: SEED DATA — DEFAULT PERMISSIONS
-- ============================================================================

INSERT INTO public.permissions (code, description) VALUES
  ('students.view', 'View student records'),
  ('students.create', 'Create student records'),
  ('students.edit', 'Edit student records'),
  ('students.delete', 'Delete student records'),
  ('staff.view', 'View staff records'),
  ('staff.create', 'Create staff records'),
  ('staff.edit', 'Edit staff records'),
  ('staff.delete', 'Delete staff records'),
  ('classes.manage', 'Manage classes'),
  ('subjects.manage', 'Manage subjects'),
  ('sessions.manage', 'Manage academic sessions'),
  ('terms.manage', 'Manage terms'),
  ('attendance.manage', 'Manage attendance'),
  ('assignments.manage', 'Manage assignments'),
  ('notes.manage', 'Manage notes'),
  ('cbt.manage', 'Manage CBT examinations'),
  ('results.manage', 'Manage results'),
  ('results.approve', 'Approve results'),
  ('results.publish', 'Publish results'),
  ('payments.manage', 'Manage payments'),
  ('timetable.manage', 'Manage timetable'),
  ('announcements.manage', 'Manage announcements'),
  ('notifications.manage', 'Manage notifications'),
  ('analytics.view', 'View analytics'),
  ('audit.view', 'View audit logs'),
  ('id_cards.manage', 'Manage ID cards (Super Admin only)'),
  ('scratch_cards.manage', 'Manage scratch cards (Super Admin only)'),
  ('system.settings', 'Manage system settings (Super Admin only)'),
  ('cms.manage', 'Manage CMS content');

-- Assign permissions to roles
-- Super Admin: all permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'super_admin', id FROM public.permissions;

-- School Admin: all except super-admin-only
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'school_admin', id FROM public.permissions
WHERE code NOT IN ('id_cards.manage', 'scratch_cards.manage', 'system.settings');

-- Teacher: limited academic permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'teacher', id FROM public.permissions
WHERE code IN (
  'students.view', 'attendance.manage', 'assignments.manage',
  'notes.manage', 'cbt.manage', 'results.manage', 'analytics.view'
);

-- Student/Parent: view-only
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'student_parent', id FROM public.permissions
WHERE code IN ('students.view', 'analytics.view');

-- ============================================================================
-- SECTION 30: SEED DATA — DEFAULT SCHOOL SETTINGS
-- ============================================================================

INSERT INTO public.school_settings (school_name, currency, currency_symbol)
VALUES ('Spring Montessori School', 'NGN', '₦');

-- ============================================================================
-- SECTION 31: CONTACT MESSAGES TABLE
-- ============================================================================

CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_messages_admin_read" ON public.contact_messages
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin'))
  );

CREATE POLICY "contact_messages_public_insert" ON public.contact_messages
  FOR INSERT TO anon WITH CHECK (true);

-- ============================================================================
-- SECTION 32: SEED DATA — DEFAULT CMS PAGES
-- ============================================================================

INSERT INTO public.cms_pages (slug, title, content, is_published) VALUES
  ('about', 'About Us', '{"sections": []}', false),
  ('academics', 'Academics', '{"sections": []}', false),
  ('admission', 'Admission', '{"sections": []}', false),
  ('contact', 'Contact Us', '{"sections": []}', false);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
