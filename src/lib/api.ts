import { supabase, isSupabaseConfigured } from './supabase';
import { 
  Student, 
  Instructor, 
  Subject, 
  Level, 
  ClassUpdate, 
  Homework, 
  SaveClassUpdatePayload,
  UserProfile
} from '../types';
import { 
  ENGLISH_LEVELS_DISPLAY_ORDER, 
  MATH_BTM_LEVELS_DISPLAY_ORDER,
  MATH_CTM_LEVELS_DISPLAY_ORDER, 
  StudentLastLevels 
} from '../constants/levels';

// ==========================================
// LOCAL STORAGE DEMO MOCK STORE (FOR OFFLINE / INITIAL DEV)
// ==========================================
const MOCK_STORAGE_KEY = 'class_management_mock_db_v6';

interface MockDB {
  students: Student[];
  instructors: Instructor[];
  subjects: Subject[];
  levels: Level[];
  class_updates: ClassUpdate[];
  homework: Homework[];
  profiles: UserProfile[];
}

const mockEnglishLevels: Level[] = ENGLISH_LEVELS_DISPLAY_ORDER.map((lvl, idx) => ({
  id: `lvl-eng-${lvl}`,
  name: lvl,
  category: 'English',
  display_order: idx + 1,
  active: true,
}));

const mockBtmLevels: Level[] = MATH_BTM_LEVELS_DISPLAY_ORDER.map((lvl, idx) => ({
  id: `lvl-btm-${lvl}`,
  name: lvl,
  category: 'BTM',
  display_order: idx + 1,
  active: true,
}));

const mockCtmLevels: Level[] = MATH_CTM_LEVELS_DISPLAY_ORDER.map((lvl, idx) => ({
  id: `lvl-ctm-${lvl}`,
  name: lvl,
  category: 'CTM',
  display_order: idx + 1,
  active: true,
}));

const initialMockDB: MockDB = {
  instructors: [
    { id: '49185b37-5ee8-45b2-9b7b-15911c811741', name: 'Raj', email: 'rajaram.class@gmail.com', active: true },
    { id: '3e02d957-db76-4e43-a671-5f53e564a7e3', name: 'Shriyam', email: 'chaturvedishriyam5@gmail.com', active: true },
    { id: '7d95d723-012f-4619-a6f0-1f9c8af41190', name: 'Elma', email: 'boviii2024@gmail.com', active: true },
    { id: 'fa858f4f-1107-43bb-98cb-18f1bb76fef4', name: 'Ayush', email: 'ayushsinghbisht62005@gmail.com', active: true },
    { id: 'c2688236-e665-43d6-9db5-a4beda965391', name: 'Himanshi', email: 'himanshii1605@gmail.com', active: true },
    { id: '56c3a3be-d207-4d4e-8c40-74456525fd01', name: 'Ravali', email: 'ravali@example.com', active: true },
    { id: '7242cee1-6067-4cb1-9d03-f543649e8e1f', name: 'Shaheen', email: 'shaheensyed2003@gmail.com', active: true },
    { id: '2294db43-39ae-4dbb-97ed-2a30548d5054', name: 'Lincy', email: 'lincyrose03@gmail.com', active: true },
    { id: '1e25fd43-bfcb-4c95-a864-996691ee5ac8', name: 'Priya', email: 'priya@example.com', active: true },
    { id: '441bbd32-ea6c-48a1-9670-ee65ea4587fa', name: 'Admin User', email: 'admin@example.com', active: true },
  ],
  students: [
    { 
      id: 'stud-1', 
      name: 'Arya', 
      default_english_level: '5', 
      default_btm_level: '14', 
      default_ctm_level: '13', 
      active: true 
    },
    { 
      id: 'stud-2', 
      name: 'Anish', 
      default_english_level: '5', 
      default_btm_level: 'Summit', 
      default_ctm_level: 'X', 
      active: true 
    },
    { 
      id: 'stud-3', 
      name: 'Anith Rao', 
      default_english_level: '6', 
      default_btm_level: 'Summit', 
      default_ctm_level: 'X', 
      active: true 
    },
    { 
      id: 'stud-4', 
      name: 'Pragathi', 
      default_english_level: '6', 
      default_btm_level: 'Summit', 
      default_ctm_level: 'X', 
      active: true 
    },
    { 
      id: 'stud-5', 
      name: 'Arohi', 
      default_english_level: 'None', 
      default_btm_level: '17', 
      default_ctm_level: '15', 
      active: true 
    },
    { 
      id: 'stud-6', 
      name: 'Anay', 
      default_english_level: 'None', 
      default_btm_level: '21', 
      default_ctm_level: '19', 
      active: true 
    },
    { 
      id: 'stud-7', 
      name: 'Swara', 
      default_english_level: 'None', 
      default_btm_level: '22', 
      default_ctm_level: '20', 
      active: true 
    },
    { 
      id: 'stud-8', 
      name: 'Jia', 
      default_english_level: '6', 
      default_btm_level: '21', 
      default_ctm_level: '19', 
      active: true 
    },
    { 
      id: 'stud-9', 
      name: 'Anika', 
      default_english_level: 'F', 
      default_btm_level: '9', 
      default_ctm_level: '7', 
      active: true 
    },
    { 
      id: 'stud-10', 
      name: 'Aadvik', 
      default_english_level: '5', 
      default_btm_level: 'None', 
      default_ctm_level: 'None', 
      active: true 
    },
    { 
      id: 'stud-11', 
      name: 'Arihan', 
      default_english_level: 'F', 
      default_btm_level: '9', 
      default_ctm_level: '7', 
      active: true 
    },
    { 
      id: 'stud-12', 
      name: 'Kiaan', 
      default_english_level: '5', 
      default_btm_level: '16', 
      default_ctm_level: '12', 
      active: true 
    },
    { 
      id: 'stud-13', 
      name: 'Mishti', 
      default_english_level: '6', 
      default_btm_level: 'None', 
      default_ctm_level: 'None', 
      active: true 
    },
  ],
  subjects: [
    { id: 'sub-1', name: 'English', active: true },
    { id: 'sub-2', name: 'Math', active: true },
  ],
  levels: [
    ...mockEnglishLevels,
    ...mockBtmLevels,
    ...mockCtmLevels,
  ],
  class_updates: [
    {
      id: 'cu-1',
      student_id: 'stud-1', // Arya
      instructor_id: '3e02d957-db76-4e43-a671-5f53e564a7e3', // Shriyam
      subject_id: 'sub-2', // Math
      btm_level: '14',
      ctm_level: '13',
      class_date: '2026-08-18',
      duration_minutes: 60,
      booklet_number: 'BTM-14 / CTM-13',
      cw: 'Completed algebraic expressions & geometry theorems.',
      hw: 'Booklet BTM 14 Pages 7 to 12 & CTM 13 Exercise 2',
      created_at: '2026-08-18T10:00:00Z',
    },
    {
      id: 'cu-2',
      student_id: 'stud-1', // Arya
      instructor_id: '7d95d723-012f-4619-a6f0-1f9c8af41190', // Elma
      subject_id: 'sub-1', // English
      english_level: '5',
      class_date: '2026-08-19',
      duration_minutes: 60,
      booklet_number: 'Eng-5A',
      cw: 'Analytical reading and narrative essay writing.',
      hw: 'Booklet 5A Pages 14 to 18 (Grammar revision)',
      created_at: '2026-08-19T11:00:00Z',
    },
    {
      id: 'cu-3',
      student_id: 'stud-2', // Anish
      instructor_id: '49185b37-5ee8-45b2-9b7b-15911c811741', // Raj
      subject_id: 'sub-2', // Math
      btm_level: 'Summit',
      ctm_level: 'X',
      class_date: '2026-08-20',
      duration_minutes: 60,
      booklet_number: 'Summit-M1',
      cw: 'Summit Olympiad advanced problem solving & logical puzzles.',
      hw: 'Summit Workbook Pages 5 to 11',
      created_at: '2026-08-20T10:00:00Z',
    },
    {
      id: 'cu-4',
      student_id: 'stud-3', // Anith Rao
      instructor_id: 'fa858f4f-1107-43bb-98cb-18f1bb76fef4', // Ayush
      subject_id: 'sub-2', // Math
      btm_level: 'Summit',
      ctm_level: 'X',
      class_date: '2026-08-21',
      duration_minutes: 60,
      booklet_number: 'Summit-M2',
      cw: 'Summit quadratic equations and competitive problem solving.',
      hw: 'Summit Workbook 2 Pages 8 to 14',
      created_at: '2026-08-21T10:00:00Z',
    },
    {
      id: 'cu-5',
      student_id: 'stud-9', // Anika
      instructor_id: 'c2688236-e665-43d6-9db5-a4beda965391', // Himanshi
      subject_id: 'sub-1', // English
      english_level: 'F',
      class_date: '2026-08-22',
      duration_minutes: 45,
      booklet_number: 'Eng-F3',
      cw: 'Reading comprehension and figurative language.',
      hw: 'Booklet F3 Pages 10, 12, 14',
      created_at: '2026-08-22T10:00:00Z',
    }
  ],
  homework: [
    {
      id: 'hw-101',
      student_id: 'stud-1', // Arya
      class_update_id: 'cu-1',
      subject_id: 'sub-2', // Math
      homework_text: 'Booklet BTM 14 Pages 7 to 12 & CTM 13 Exercise 2',
      assigned_date: '2026-08-18',
      checked: false,
    },
    {
      id: 'hw-102',
      student_id: 'stud-1', // Arya
      class_update_id: 'cu-2',
      subject_id: 'sub-1', // English
      homework_text: 'Booklet 5A Pages 14 to 18 (Grammar revision)',
      assigned_date: '2026-08-19',
      checked: false,
    },
    {
      id: 'hw-103',
      student_id: 'stud-2', // Anish
      class_update_id: 'cu-3',
      subject_id: 'sub-2', // Math
      homework_text: 'Summit Workbook Pages 5 to 11',
      assigned_date: '2026-08-20',
      checked: false,
    },
    {
      id: 'hw-104',
      student_id: 'stud-3', // Anith Rao
      class_update_id: 'cu-4',
      subject_id: 'sub-2', // Math
      homework_text: 'Summit Workbook 2 Pages 8 to 14',
      assigned_date: '2026-08-21',
      checked: false,
    },
    {
      id: 'hw-105',
      student_id: 'stud-9', // Anika
      class_update_id: 'cu-5',
      subject_id: 'sub-1', // English
      homework_text: 'Booklet F3 Pages 10, 12, 14',
      assigned_date: '2026-08-22',
      checked: false,
    }
  ],
  profiles: [
    { id: 'usr-admin', email: 'admin@example.com', full_name: 'Admin User', role: 'admin', instructor_id: '441bbd32-ea6c-48a1-9670-ee65ea4587fa' },
    { id: 'usr-raj', email: 'rajaram.class@gmail.com', full_name: 'Raj', role: 'instructor', instructor_id: '49185b37-5ee8-45b2-9b7b-15911c811741' },
    { id: 'usr-shriyam', email: 'chaturvedishriyam5@gmail.com', full_name: 'Shriyam', role: 'instructor', instructor_id: '3e02d957-db76-4e43-a671-5f53e564a7e3' },
  ]
};

function getMockDB(): MockDB {
  const saved = localStorage.getItem(MOCK_STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(initialMockDB));
    return initialMockDB;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return initialMockDB;
  }
}

function saveMockDB(db: MockDB) {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
}

// ==========================================
// UNIFIED DATA SERVICE API
// ==========================================

export const api = {
  // Students
  async getStudents(): Promise<Student[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('students').select('*').order('name');
      if (error) throw error;
      return data || [];
    }
    return getMockDB().students;
  },

  async getStudentLastLevels(studentId: string): Promise<StudentLastLevels> {
    if (!studentId) return {};

    if (isSupabaseConfigured) {
      const { data: student } = await supabase
        .from('students')
        .select('default_english_level, default_btm_level, default_ctm_level')
        .eq('id', studentId)
        .single();

      if (student) {
        return {
          english_level: student.default_english_level,
          btm_level: student.default_btm_level,
          ctm_level: student.default_ctm_level,
        };
      }
    }

    const db = getMockDB();
    const student = db.students.find(s => s.id === studentId);
    return {
      english_level: student?.default_english_level || 'None',
      btm_level: student?.default_btm_level || 'None',
      ctm_level: student?.default_ctm_level || 'None',
    };
  },

  async createStudent(student: Omit<Student, 'id'>): Promise<Student> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('students').insert([student]).select().single();
      if (error) throw error;
      return data;
    }
    const db = getMockDB();
    const newStudent: Student = { ...student, id: 'stud-' + Date.now() };
    db.students.push(newStudent);
    saveMockDB(db);
    return newStudent;
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('students').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }
    const db = getMockDB();
    const idx = db.students.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Student not found');
    db.students[idx] = { ...db.students[idx], ...updates };
    saveMockDB(db);
    return db.students[idx];
  },

  // Instructors
  async getInstructors(): Promise<Instructor[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('instructors').select('*').order('name');
      if (error) throw error;
      return data || [];
    }
    return getMockDB().instructors;
  },

  async createInstructor(instructor: Omit<Instructor, 'id'>): Promise<Instructor> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('instructors').insert([instructor]).select().single();
      if (error) throw error;
      return data;
    }
    const db = getMockDB();
    const newInst: Instructor = { ...instructor, id: 'inst-' + Date.now() };
    db.instructors.push(newInst);
    saveMockDB(db);
    return newInst;
  },

  // Subjects & Levels
  async getSubjects(): Promise<Subject[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('subjects').select('*').order('name');
      if (error) throw error;
      return data || [];
    }
    return getMockDB().subjects;
  },

  async getLevels(category?: 'English' | 'BTM' | 'CTM'): Promise<Level[]> {
    if (isSupabaseConfigured) {
      let query = supabase.from('levels').select('*').order('display_order');
      if (category) query = query.eq('category', category);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
    const db = getMockDB();
    if (category) {
      return db.levels.filter(l => l.category === category);
    }
    return db.levels;
  },

  // Pending Homework for Class Entry Screen (Filtered by student, unchecked status, and subject)
  async getPendingHomework(studentId: string, beforeDate: string, subjectId?: string): Promise<Homework[]> {
    if (!studentId) return [];

    if (isSupabaseConfigured) {
      let query = supabase
        .from('homework')
        .select(`
          *, 
          subject:subjects(id, name),
          class_update:class_updates(id, booklet_number, cw, class_date, btm_level, ctm_level, english_level)
        `)
        .eq('student_id', studentId)
        .eq('checked', false)
        .lte('assigned_date', beforeDate)
        .order('assigned_date', { ascending: true });

      if (subjectId) {
        query = query.eq('subject_id', subjectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }

    // Mock DB retrieval with joined class updates
    const db = getMockDB();
    return db.homework
      .filter(h => {
        const matchesStudent = h.student_id === studentId;
        const matchesUnchecked = !h.checked;
        const matchesDate = h.assigned_date <= beforeDate;
        const matchesSubject = subjectId ? h.subject_id === subjectId : true;
        return matchesStudent && matchesUnchecked && matchesDate && matchesSubject;
      })
      .map(h => ({
        ...h,
        subject: db.subjects.find(s => s.id === h.subject_id),
        class_update: db.class_updates.find(c => c.id === h.class_update_id),
      }))
      .sort((a, b) => a.assigned_date.localeCompare(b.assigned_date));
  },

  // Check Duplicate Class Record
  async checkDuplicateClass(studentId: string, instructorId: string, subjectId: string, classDate: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('class_updates')
        .select('id')
        .eq('student_id', studentId)
        .eq('instructor_id', instructorId)
        .eq('subject_id', subjectId)
        .eq('class_date', classDate)
        .maybeSingle();

      if (error) throw error;
      return Boolean(data);
    }

    const db = getMockDB();
    return db.class_updates.some(
      c => c.student_id === studentId &&
           c.instructor_id === instructorId &&
           c.subject_id === subjectId &&
           c.class_date === classDate
    );
  },

  // Atomic Save Class Update
  async saveClassUpdate(payload: SaveClassUpdatePayload): Promise<{ success: boolean; class_update_id: string }> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.rpc('save_class_update', {
        p_student_id: payload.student_id,
        p_instructor_id: payload.instructor_id,
        p_subject_id: payload.subject_id,
        p_level_id: payload.level_id || null,
        p_english_level: payload.english_level || null,
        p_btm_level: payload.btm_level || null,
        p_ctm_level: payload.ctm_level || null,
        p_class_date: payload.class_date,
        p_duration_minutes: payload.duration_minutes,
        p_booklet_number: payload.booklet_number || null,
        p_cw: payload.cw || null,
        p_hw: payload.hw || null,
        p_checked_homework_ids: payload.checked_homework_ids || []
      });

      if (error) throw error;
      return data;
    }

    // Mock Atomic Transaction
    const db = getMockDB();
    
    // Check uniqueness constraint
    const exists = db.class_updates.some(
      c => c.student_id === payload.student_id &&
           c.instructor_id === payload.instructor_id &&
           c.subject_id === payload.subject_id &&
           c.class_date === payload.class_date
    );

    if (exists) {
      throw new Error(`A class record already exists for this student, instructor, and subject on ${payload.class_date}`);
    }

    const newClassId = 'cu-' + Date.now();
    const newClassRecord: ClassUpdate = {
      id: newClassId,
      student_id: payload.student_id,
      instructor_id: payload.instructor_id,
      subject_id: payload.subject_id,
      level_id: payload.level_id,
      english_level: payload.english_level,
      btm_level: payload.btm_level,
      ctm_level: payload.ctm_level,
      class_date: payload.class_date,
      duration_minutes: payload.duration_minutes,
      booklet_number: payload.booklet_number,
      cw: payload.cw,
      hw: payload.hw,
      created_at: new Date().toISOString()
    };
    db.class_updates.push(newClassRecord);

    // Update student's default/remembered levels
    const studentIdx = db.students.findIndex(s => s.id === payload.student_id);
    if (studentIdx !== -1) {
      if (payload.english_level) {
        db.students[studentIdx].default_english_level = payload.english_level;
      }
      if (payload.btm_level) {
        db.students[studentIdx].default_btm_level = payload.btm_level;
      }
      if (payload.ctm_level) {
        db.students[studentIdx].default_ctm_level = payload.ctm_level;
      }
    }

    // Insert new homework if provided
    if (payload.hw && payload.hw.trim()) {
      db.homework.push({
        id: 'hw-' + Date.now(),
        student_id: payload.student_id,
        class_update_id: newClassId,
        subject_id: payload.subject_id,
        homework_text: payload.hw.trim(),
        assigned_date: payload.class_date,
        checked: false
      });
    }

    // Mark previous checked homework
    if (payload.checked_homework_ids && payload.checked_homework_ids.length > 0) {
      db.homework = db.homework.map(hw => {
        if (payload.checked_homework_ids.includes(hw.id)) {
          return {
            ...hw,
            checked: true,
            checked_date: payload.class_date,
            checked_by: payload.instructor_id,
            updated_at: new Date().toISOString()
          };
        }
        return hw;
      });
    }

    saveMockDB(db);
    return { success: true, class_update_id: newClassId };
  },

  // Get Class History / Reports
  async getClassUpdates(filters?: {
    studentId?: string;
    instructorId?: string;
    subjectId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ClassUpdate[]> {
    if (isSupabaseConfigured) {
      let query = supabase
        .from('class_updates')
        .select(`
          *,
          student:students(*),
          instructor:instructors(*),
          subject:subjects(*),
          level:levels(*)
        `)
        .order('class_date', { ascending: false });

      if (filters?.studentId) query = query.eq('student_id', filters.studentId);
      if (filters?.instructorId) query = query.eq('instructor_id', filters.instructorId);
      if (filters?.subjectId) query = query.eq('subject_id', filters.subjectId);
      if (filters?.startDate) query = query.gte('class_date', filters.startDate);
      if (filters?.endDate) query = query.lte('class_date', filters.endDate);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }

    const db = getMockDB();
    return db.class_updates
      .filter(c => {
        if (filters?.studentId && c.student_id !== filters.studentId) return false;
        if (filters?.instructorId && c.instructor_id !== filters.instructorId) return false;
        if (filters?.subjectId && c.subject_id !== filters.subjectId) return false;
        if (filters?.startDate && c.class_date < filters.startDate) return false;
        if (filters?.endDate && c.class_date > filters.endDate) return false;
        return true;
      })
      .map(c => ({
        ...c,
        student: db.students.find(s => s.id === c.student_id),
        instructor: db.instructors.find(i => i.id === c.instructor_id),
        subject: db.subjects.find(s => s.id === c.subject_id),
        level: db.levels.find(l => l.id === c.level_id)
      }))
      .sort((a, b) => b.class_date.localeCompare(a.class_date));
  },

  // Get Homework History
  async getHomeworkList(studentId?: string): Promise<Homework[]> {
    if (isSupabaseConfigured) {
      let query = supabase
        .from('homework')
        .select(`*, student:students(*), subject:subjects(*), instructor:instructors(*)`)
        .order('assigned_date', { ascending: false });

      if (studentId) query = query.eq('student_id', studentId);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }

    const db = getMockDB();
    return db.homework
      .filter(h => studentId ? h.student_id === studentId : true)
      .map(h => ({
        ...h,
        student: db.students.find(s => s.id === h.student_id),
        subject: db.subjects.find(s => s.id === h.subject_id),
        instructor: db.instructors.find(i => i.id === h.checked_by)
      }))
      .sort((a, b) => b.assigned_date.localeCompare(a.assigned_date));
  },

  // Change currently logged-in user's own password
  async changeMyPassword(newPassword: string): Promise<{ success: boolean; message: string }> {
    if (!newPassword || newPassword.trim().length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.updateUser({
        password: newPassword.trim(),
      });
      if (error) throw error;
      return { success: true, message: 'Your password has been changed successfully!' };
    }

    // Mock update
    return { success: true, message: 'Password updated successfully in local sandbox mode.' };
  },

  // Admin resets an instructor's password
  async adminSetInstructorPassword(instructorEmail: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    if (!newPassword || newPassword.trim().length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.rpc('admin_set_user_password', {
        p_user_email: instructorEmail.trim(),
        p_new_password: newPassword.trim(),
      });

      if (error) throw error;
      return data || { success: true, message: `Password for ${instructorEmail} updated successfully!` };
    }

    // Mock update
    return { success: true, message: `Password for ${instructorEmail} reset successfully in local sandbox mode.` };
  }
};

