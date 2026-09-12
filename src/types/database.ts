export type AppRole = 'super_admin' | 'school_admin' | 'teacher' | 'student_parent';

export type Gender = 'male' | 'female';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type AttendanceMethod = 'manual' | 'qr_scan';
export type AttendanceType = 'student' | 'staff';

export type ExamType = 'mid_term' | 'end_of_term';
export type QuestionType = 'mcq' | 'true_false' | 'short_answer';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type ExamStatus = 'draft' | 'published' | 'closed' | 'archived';

export type SecurityEventType =
  | 'tab_switch'
  | 'window_blur'
  | 'visibility_change'
  | 'navigation_attempt'
  | 'exam_lock'
  | 'exam_unlock';

export type SyncStatus = 'pending' | 'synced' | 'failed';
export type AttemptStatus = 'in_progress' | 'submitted' | 'auto_submitted' | 'locked' | 'synced';
export type ResultStatus = 'draft' | 'pending_approval' | 'approved' | 'published';
export type ScratchCardStatus = 'unused' | 'active' | 'exhausted';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overpaid';

export type AuditAction =
  | 'create' | 'update' | 'delete' | 'view' | 'approve'
  | 'publish' | 'submit' | 'generate' | 'export' | 'login' | 'logout';

export type ClassLevel =
  | 'primary_1' | 'primary_2' | 'primary_3' | 'primary_4' | 'primary_5' | 'primary_6'
  | 'jss_1' | 'jss_2' | 'jss_3'
  | 'ss_1' | 'ss_2' | 'ss_3';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type AnnouncementTarget = 'all' | 'class' | 'students_parents' | 'teachers_staff';
export type NotificationType = 'assignment' | 'cbt' | 'result' | 'payment' | 'announcement' | 'admission' | 'general';
export type AssignmentStatus = 'draft' | 'published' | 'closed' | 'archived';
export type TimetableType = 'class' | 'teacher' | 'examination';
export type IdCardType = 'student' | 'staff';

// Database table types
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: AppRole;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SchoolSettings {
  id: string;
  school_name: string;
  school_motto: string | null;
  logo_url: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  current_session_id: string | null;
  current_term_id: string | null;
  grading_system: Record<string, unknown>;
  result_config: Record<string, unknown>;
  currency: string;
  currency_symbol: string;
  created_at: string;
  updated_at: string;
}

export interface AcademicSession {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Term {
  id: string;
  session_id: string;
  name: string;
  term_number: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  name: string;
  class_level: ClassLevel;
  arm: string | null;
  session_id: string;
  class_teacher_id: string | null;
  capacity: number | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: string;
  user_id: string | null;
  staff_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  gender: Gender | null;
  date_of_birth: string | null;
  photo_url: string | null;
  address: string | null;
  department: string | null;
  role: string;
  app_role: AppRole;
  qualification: string | null;
  employment_date: string | null;
  employment_status: string;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  user_id: string | null;
  student_id: string;
  admission_number: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  gender: Gender | null;
  date_of_birth: string | null;
  photo_url: string | null;
  address: string | null;
  blood_group: string | null;
  genotype: string | null;
  state_of_origin: string | null;
  local_government: string | null;
  nationality: string;
  religion: string | null;
  previous_school: string | null;
  admission_date: string | null;
  admission_class_id: string | null;
  status: string;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Family {
  id: string;
  user_id: string | null;
  family_name: string;
  contact_name: string;
  email: string | null;
  phone: string;
  alternate_phone: string | null;
  address: string | null;
  relationship: string | null;
  occupation: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentEnrollment {
  id: string;
  student_id: string;
  class_id: string;
  session_id: string;
  term_id: string;
  enrollment_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  person_id: string;
  person_type: AttendanceType;
  date: string;
  time_in: string | null;
  time_out: string | null;
  status: AttendanceStatus;
  method: AttendanceMethod;
  class_id: string | null;
  session_id: string | null;
  term_id: string | null;
  marked_by: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

export interface Examination {
  id: string;
  title: string;
  subject_id: string;
  class_id: string;
  session_id: string;
  term_id: string;
  exam_type: ExamType;
  duration_minutes: number;
  total_marks: number;
  total_questions: number;
  instructions: string | null;
  start_time: string | null;
  end_time: string | null;
  status: ExamStatus;
  allow_question_shuffle: boolean;
  show_result_after_submit: boolean;
  unlock_code: string | null;
  created_by: string | null;
  published_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExaminationAttempt {
  id: string;
  unique_id: string;
  examination_id: string;
  student_id: string;
  attempt_number: number;
  status: AttemptStatus;
  started_at: string;
  submitted_at: string | null;
  score: number | null;
  total_marks: number | null;
  percentage: number | null;
  time_spent_seconds: number | null;
  is_locked: boolean;
  locked_at: string | null;
  locked_by: string | null;
  unlocked_at: string | null;
  unlocked_by: string | null;
  sync_status: SyncStatus;
  local_data: Record<string, unknown> | null;
  integrity_hash: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface StudentResult {
  id: string;
  student_id: string;
  subject_id: string;
  class_id: string;
  session_id: string;
  term_id: string;
  result_configuration_id: string | null;
  total_score: number | null;
  percentage: number | null;
  grade: string | null;
  remark: string | null;
  position: number | null;
  status: ResultStatus;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResultScratchCard {
  id: string;
  student_id: string;
  session_id: string;
  term_id: string;
  card_code: string;
  pin: string;
  max_attempts: number;
  remaining_attempts: number;
  status: ScratchCardStatus;
  activated_at: string | null;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  metadata: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}
