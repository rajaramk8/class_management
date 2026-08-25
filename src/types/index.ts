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
