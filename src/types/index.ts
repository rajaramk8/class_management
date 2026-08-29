export type UserRole = 'admin' | 'instructor';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  instructor_id?: string | null;
}

export interface Student {
  id: string;
  name: string;
  notes?: string | null;
  active: boolean;
  default_english_level?: string | null;
  default_btm_level?: string | null;
  default_ctm_level?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Instructor {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Subject {
  id: string;
  name: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Level {
  id: string;
  name: string;
  category?: 'English' | 'BTM' | 'CTM' | string;
  display_order: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ClassUpdate {
  id: string;
  student_id: string;
  instructor_id: string;
  subject_id: string;
  level_id?: string | null;
  english_level?: string | null;
  btm_level?: string | null;
  ctm_level?: string | null;
  class_date: string;
  duration_minutes: number;
  booklet_number?: string | null;
  cw?: string | null;
  hw?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;

  // Joined fields for display
  student?: Student;
  instructor?: Instructor;
  subject?: Subject;
  level?: Level;
}

export interface Homework {
  id: string;
  student_id: string;
  class_update_id: string;
  subject_id: string;
  homework_text: string;
  assigned_date: string;
  checked: boolean;
  checked_date?: string | null;
  checked_by?: string | null;
  created_at?: string;
  updated_at?: string;

  // Joined fields
  student?: Student;
  subject?: Subject;
  instructor?: Instructor;
  class_update?: ClassUpdate;
}

export interface SaveClassUpdatePayload {
  student_id: string;
  instructor_id: string;
  subject_id: string;
  level_id?: string | null;
  english_level?: string | null;
  btm_level?: string | null;
  ctm_level?: string | null;
  class_date: string;
  duration_minutes: number;
  booklet_number?: string;
  cw?: string;
  hw?: string;
  checked_homework_ids: string[];
}

export interface UpdateClassUpdatePayload {
  student_id?: string;
  instructor_id?: string;
  subject_id?: string;
  level_id?: string | null;
  english_level?: string | null;
  btm_level?: string | null;
  ctm_level?: string | null;
  class_date?: string;
  duration_minutes?: number;
  booklet_number?: string | null;
  cw?: string | null;
  hw?: string | null;
}

// ==========================================
// PARENT PROGRESS REPORT & ACCESS TYPES
// ==========================================

export interface ParentAccess {
  id: string;
  student_id: string;
  access_token: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  last_accessed_at?: string | null;
  failed_attempts?: number;
  lockout_until?: string | null;
  has_pin?: boolean;

  // Joined fields
  student?: Student;
}

export type ParentFeedbackRating = 'good' | 'okay' | 'needs_attention';
export type ParentFeedbackStatus = 'new' | 'reviewed' | 'responded';
export type ContactReason = 'progress' | 'homework' | 'difficulty' | 'general' | 'other';

export interface ParentFeedback {
  id: string;
  student_id: string;
  parent_access_id?: string | null;
  rating?: ParentFeedbackRating | null;
  feedback_text?: string | null;
  contact_requested: boolean;
  contact_reason?: ContactReason | string | null;
  status: ParentFeedbackStatus;
  created_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  responded_at?: string | null;
  admin_notes?: string | null;

  // Joined fields
  student?: Student;
  reviewer?: Instructor;
}

export interface ParentReportData {
  student: {
    id: string;
    name: string;
    english_level?: string | null;
    btm_level?: string | null;
    ctm_level?: string | null;
  };
  summary: {
    classes_this_month: number;
    hours_this_month: number;
    total_classes: number;
    total_hours: number;
    homework_completed: number;
    homework_pending: number;
  };
  recent_classes: ClassUpdate[];
  pending_homework: Homework[];
  completed_homework: Homework[];
  last_updated: string;
}

export interface VerifyParentAccessResponse {
  success: boolean;
  report?: ParentReportData;
  error?: string;
  locked_out?: boolean;
  lockout_seconds?: number;
}

export interface SubmitParentFeedbackParams {
  token: string;
  pin: string;
  rating?: ParentFeedbackRating | null;
  feedback_text?: string;
  contact_requested: boolean;
  contact_reason?: string;
}
