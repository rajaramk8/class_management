import { supabase, isSupabaseConfigured } from './supabase';
import { 
  Student, 
  Instructor, 
  Subject, 
  Level, 
  ClassUpdate, 
  Homework, 
  SaveClassUpdatePayload,
  UpdateClassUpdatePayload,
  UserProfile,
  ParentAccess,
  ParentFeedback,
  ParentFeedbackStatus,
  VerifyParentAccessResponse,
  SubmitParentFeedbackParams,
  HomeworkStatusUpdate,
  HomeworkStatusValue
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
const MOCK_STORAGE_KEY = 'class_management_mock_db_v8';

interface MockDB {
  students: Student[];
  instructors: Instructor[];
  subjects: Subject[];
  levels: Level[];
  class_updates: ClassUpdate[];
  homework: Homework[];
  homework_status_history: HomeworkStatusUpdate[];
  profiles: UserProfile[];
  parent_access: (ParentAccess & { pin_plain?: string })[];
  parent_feedback: ParentFeedback[];
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
  homework_status_history: [
    {
      id: 'hsh-1',
      homework_id: 'hw-101',
      status: 'Not done',
      note: 'Student did not complete the homework before class.',
      created_by: '3e02d957-db76-4e43-a671-5f53e564a7e3', // Shriyam
      created_at: '2026-08-18T10:05:00Z',
    },
    {
      id: 'hsh-2',
      homework_id: 'hw-101',
      status: 'Partially completed',
      note: 'Pages 7 and 11 completed in revision.',
      created_by: '7d95d723-012f-4619-a6f0-1f9c8af41190', // Elma
      created_at: '2026-08-22T11:00:00Z',
    },
    {
      id: 'hsh-3',
      homework_id: 'hw-102',
      status: 'Needs correction',
      note: 'Pages 14 and 15 need grammar corrections.',
      created_by: '7d95d723-012f-4619-a6f0-1f9c8af41190', // Elma
      created_at: '2026-08-20T14:30:00Z',
    }
  ],
  profiles: [
    { id: 'usr-admin', email: 'admin@example.com', full_name: 'Admin User', role: 'admin', instructor_id: '441bbd32-ea6c-48a1-9670-ee65ea4587fa' },
    { id: 'usr-raj', email: 'rajaram.class@gmail.com', full_name: 'Raj', role: 'instructor', instructor_id: '49185b37-5ee8-45b2-9b7b-15911c811741' },
    { id: 'usr-shriyam', email: 'chaturvedishriyam5@gmail.com', full_name: 'Shriyam', role: 'instructor', instructor_id: '3e02d957-db76-4e43-a671-5f53e564a7e3' },
  ],
  parent_access: [
    { id: 'pa-1', student_id: 'stud-1', access_token: '7Kp92xQm-arya-sample-token-123', active: true, pin_plain: '1234', created_at: '2026-08-01T00:00:00Z', updated_at: '2026-08-01T00:00:00Z' },
    { id: 'pa-2', student_id: 'stud-2', access_token: '8Lq03yRn-anish-sample-token-456', active: true, pin_plain: '1234', created_at: '2026-08-01T00:00:00Z', updated_at: '2026-08-01T00:00:00Z' },
    { id: 'pa-3', student_id: 'stud-3', access_token: '9Mr14zSo-anith-sample-token-789', active: true, pin_plain: '1234', created_at: '2026-08-01T00:00:00Z', updated_at: '2026-08-01T00:00:00Z' },
    { id: 'pa-4', student_id: 'stud-4', access_token: '1Ns25aTp-pragathi-sample-012', active: true, pin_plain: '1234', created_at: '2026-08-01T00:00:00Z', updated_at: '2026-08-01T00:00:00Z' },
    { id: 'pa-5', student_id: 'stud-5', access_token: '2Ot36bUq-arohi-sample-345', active: true, pin_plain: '1234', created_at: '2026-08-01T00:00:00Z', updated_at: '2026-08-01T00:00:00Z' },
    { id: 'pa-6', student_id: 'stud-6', access_token: '3Pu47cVr-anay-sample-678', active: true, pin_plain: '1234', created_at: '2026-08-01T00:00:00Z', updated_at: '2026-08-01T00:00:00Z' },
    { id: 'pa-7', student_id: 'stud-7', access_token: '4Qv58dWs-swara-sample-901', active: true, pin_plain: '1234', created_at: '2026-08-01T00:00:00Z', updated_at: '2026-08-01T00:00:00Z' },
    { id: 'pa-8', student_id: 'stud-8', access_token: '5Rw69eXt-jia-sample-234', active: true, pin_plain: '1234', created_at: '2026-08-01T00:00:00Z', updated_at: '2026-08-01T00:00:00Z' },
    { id: 'pa-9', student_id: 'stud-9', access_token: '6Sx70fYu-anika-sample-567', active: true, pin_plain: '1234', created_at: '2026-08-01T00:00:00Z', updated_at: '2026-08-01T00:00:00Z' },
    { id: 'pa-10', student_id: 'stud-10', access_token: '7Ty81gZv-aadvik-sample-890', active: true, pin_plain: '1234', created_at: '2026-08-01T00:00:00Z', updated_at: '2026-08-01T00:00:00Z' },
    { id: 'pa-11', student_id: 'stud-11', access_token: '8Uz92hAw-arihan-sample-123', active: true, pin_plain: '1234', created_at: '2026-08-01T00:00:00Z', updated_at: '2026-08-01T00:00:00Z' },
    { id: 'pa-12', student_id: 'stud-12', access_token: '9Va03iBx-kiaan-sample-456', active: true, pin_plain: '1234', created_at: '2026-08-01T00:00:00Z', updated_at: '2026-08-01T00:00:00Z' },
    { id: 'pa-13', student_id: 'stud-13', access_token: '0Wb14jCy-mishti-sample-789', active: true, pin_plain: '1234', created_at: '2026-08-01T00:00:00Z', updated_at: '2026-08-01T00:00:00Z' }
  ],
  parent_feedback: [
    {
      id: 'pf-1',
      student_id: 'stud-1',
      parent_access_id: 'pa-1',
      rating: 'good',
      feedback_text: 'Arya is really enjoying the math problem-solving sessions and feels much more confident!',
      contact_requested: false,
      status: 'new',
      created_at: '2026-08-20T14:30:00Z'
    },
    {
      id: 'pf-2',
      student_id: 'stud-9',
      parent_access_id: 'pa-9',
      rating: 'needs_attention',
      feedback_text: 'Anika is finding the reading comprehension questions a bit tricky. Could we get additional practice sheets?',
      contact_requested: true,
      contact_reason: 'difficulty',
      status: 'new',
      created_at: '2026-08-23T11:00:00Z'
    }
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
      try {
        let query = supabase
          .from('homework')
          .select(`
            *, 
            subject:subjects(id, name),
            class_update:class_updates(id, booklet_number, cw, class_date, btm_level, ctm_level, english_level),
            status_history:homework_status_history(
              id, homework_id, status, note, created_at, created_by,
              instructor:instructors(id, name)
            )
          `)
          .eq('student_id', studentId)
          .eq('checked', false)
          .lte('assigned_date', beforeDate)
          .order('assigned_date', { ascending: true });

        if (subjectId) {
          query = query.eq('subject_id', subjectId);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data.map((h: any) => {
            const sortedHistory = (h.status_history || [])
              .map((sh: any) => ({
                ...sh,
                instructor_name: sh.instructor?.name || 'Instructor'
              }))
              .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            return {
              ...h,
              status_history: sortedHistory,
              latest_status: sortedHistory[0] || null
            };
          });
        }
      } catch (e) {
        console.warn('Status history join failed, falling back to simple query', e);
      }

      // Fallback query if status_history table is not created yet
      let fbQuery = supabase
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

      if (subjectId) fbQuery = fbQuery.eq('subject_id', subjectId);
      const { data: fbData, error: fbError } = await fbQuery;
      if (fbError) throw fbError;
      return (fbData || []).map(h => ({ ...h, status_history: [], latest_status: null }));
    }

    // Mock DB retrieval with joined class updates & status history
    const db = getMockDB();
    if (!db.homework_status_history) {
      db.homework_status_history = [];
    }

    return db.homework
      .filter(h => {
        const matchesStudent = h.student_id === studentId;
        const matchesUnchecked = !h.checked;
        const matchesDate = h.assigned_date <= beforeDate;
        const matchesSubject = subjectId ? h.subject_id === subjectId : true;
        return matchesStudent && matchesUnchecked && matchesDate && matchesSubject;
      })
      .map(h => {
        const history = (db.homework_status_history || [])
          .filter(sh => sh.homework_id === h.id)
          .map(sh => ({
            ...sh,
            instructor: db.instructors.find(i => i.id === sh.created_by),
            instructor_name: db.instructors.find(i => i.id === sh.created_by)?.name || 'Instructor'
          }))
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return {
          ...h,
          subject: db.subjects.find(s => s.id === h.subject_id),
          class_update: db.class_updates.find(c => c.id === h.class_update_id),
          status_history: history,
          latest_status: history[0] || null
        };
      })
      .sort((a, b) => a.assigned_date.localeCompare(b.assigned_date));
  },

  // Add a new dated Homework Status / Note
  async addHomeworkStatus(
    homeworkId: string, 
    status: HomeworkStatusValue | string, 
    note?: string, 
    instructorId?: string
  ): Promise<HomeworkStatusUpdate> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('add_homework_status', {
          p_homework_id: homeworkId,
          p_status: status,
          p_note: note?.trim() || null,
          p_instructor_id: instructorId || null,
        });
        if (!error && data) {
          return data;
        }
      } catch (rpcErr) {
        console.warn('add_homework_status RPC not found, falling back to direct insert', rpcErr);
      }

      const { data: insertData, error: insertError } = await supabase
        .from('homework_status_history')
        .insert([{
          homework_id: homeworkId,
          status: status,
          note: note?.trim() || null,
          created_by: instructorId || null,
          created_at: new Date().toISOString()
        }])
        .select('*, instructor:instructors(id, name)')
        .single();

      if (insertError) throw insertError;
      return {
        ...insertData,
        instructor_name: insertData.instructor?.name || 'Instructor'
      };
    }

    const db = getMockDB();
    const inst = db.instructors.find(i => i.id === instructorId);
    const newEntry: HomeworkStatusUpdate = {
      id: 'hsh-' + Date.now(),
      homework_id: homeworkId,
      status: status,
      note: note?.trim() || null,
      created_by: instructorId || null,
      created_at: new Date().toISOString(),
      instructor: inst,
      instructor_name: inst?.name || 'Instructor'
    };

    if (!db.homework_status_history) {
      db.homework_status_history = [];
    }
    db.homework_status_history.unshift(newEntry);
    saveMockDB(db);
    return newEntry;
  },

  // Get status history for a specific homework item
  async getHomeworkStatusHistory(homeworkId: string): Promise<HomeworkStatusUpdate[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('homework_status_history')
          .select('*, instructor:instructors(id, name)')
          .eq('homework_id', homeworkId)
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map((item: any) => ({
            ...item,
            instructor_name: item.instructor?.name || 'Instructor'
          }));
        }
      } catch (err) {
        console.warn('Failed to query homework_status_history table', err);
      }
      return [];
    }

    const db = getMockDB();
    return (db.homework_status_history || [])
      .filter(sh => sh.homework_id === homeworkId)
      .map(sh => ({
        ...sh,
        instructor: db.instructors.find(i => i.id === sh.created_by),
        instructor_name: db.instructors.find(i => i.id === sh.created_by)?.name || 'Instructor'
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
        p_checked_homework_ids: payload.checked_homework_ids || [],
        p_initial_hw_status: payload.initial_hw_status || null,
        p_initial_hw_note: payload.initial_hw_note || null,
      });

      if (!error && data) {
        return data;
      }

      // Fallback without initial status parameter if older RPC signature
      const { data: fbData, error: fbError } = await supabase.rpc('save_class_update', {
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

      if (fbError) throw fbError;

      // If initial status was provided, insert it separately if homework was created
      if (payload.hw && payload.hw.trim() && payload.initial_hw_status && fbData?.class_update_id) {
        try {
          const { data: hwRow } = await supabase
            .from('homework')
            .select('id')
            .eq('class_update_id', fbData.class_update_id)
            .single();

          if (hwRow?.id) {
            await this.addHomeworkStatus(
              hwRow.id,
              payload.initial_hw_status,
              payload.initial_hw_note,
              payload.instructor_id
            );
          }
        } catch (hwStatusErr) {
          console.warn('Could not insert initial HW status in fallback', hwStatusErr);
        }
      }

      return fbData;
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
      const newHwId = 'hw-' + Date.now();
      db.homework.push({
        id: newHwId,
        student_id: payload.student_id,
        class_update_id: newClassId,
        subject_id: payload.subject_id,
        homework_text: payload.hw.trim(),
        assigned_date: payload.class_date,
        checked: false
      });

      if (payload.initial_hw_status) {
        if (!db.homework_status_history) db.homework_status_history = [];
        db.homework_status_history.unshift({
          id: 'hsh-' + Date.now(),
          homework_id: newHwId,
          status: payload.initial_hw_status,
          note: payload.initial_hw_note?.trim() || null,
          created_by: payload.instructor_id,
          created_at: new Date().toISOString(),
          instructor_name: db.instructors.find(i => i.id === payload.instructor_id)?.name || 'Instructor'
        });
      }
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
  },

  // Update Existing Class Record
  async updateClassUpdate(id: string, payload: UpdateClassUpdatePayload): Promise<{ success: boolean; message?: string }> {
    if (isSupabaseConfigured) {
      // 1. Try calling the dedicated RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc('update_class_update', {
        p_class_update_id: id,
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
      });

      if (!rpcError) {
        return rpcData || { success: true };
      }

      // Fallback: direct table update if RPC migration hasn't been run yet
      const { error: updateError } = await supabase
        .from('class_updates')
        .update({
          student_id: payload.student_id,
          instructor_id: payload.instructor_id,
          subject_id: payload.subject_id,
          level_id: payload.level_id || null,
          english_level: payload.english_level || null,
          btm_level: payload.btm_level || null,
          ctm_level: payload.ctm_level || null,
          class_date: payload.class_date,
          duration_minutes: payload.duration_minutes,
          booklet_number: payload.booklet_number || null,
          cw: payload.cw || null,
          hw: payload.hw || null,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Sync homework table if hw was updated
      if (payload.hw !== undefined) {
        const { data: existingHw } = await supabase
          .from('homework')
          .select('id')
          .eq('class_update_id', id)
          .maybeSingle();

        if (payload.hw && payload.hw.trim()) {
          if (existingHw) {
            await supabase
              .from('homework')
              .update({
                homework_text: payload.hw.trim(),
                assigned_date: payload.class_date,
                student_id: payload.student_id,
                subject_id: payload.subject_id,
              })
              .eq('id', existingHw.id);
          } else if (payload.student_id && payload.subject_id && payload.class_date) {
            await supabase.from('homework').insert([
              {
                student_id: payload.student_id,
                class_update_id: id,
                subject_id: payload.subject_id,
                homework_text: payload.hw.trim(),
                assigned_date: payload.class_date,
                checked: false,
              },
            ]);
          }
        }
      }

      return { success: true };
    }

    // Mock DB update
    const db = getMockDB();
    const idx = db.class_updates.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Class update record not found');

    const updated = {
      ...db.class_updates[idx],
      ...payload,
      updated_at: new Date().toISOString()
    };
    db.class_updates[idx] = updated;

    // Sync student default levels if updated
    if (payload.student_id) {
      const sIdx = db.students.findIndex(s => s.id === payload.student_id);
      if (sIdx !== -1) {
        if (payload.english_level) db.students[sIdx].default_english_level = payload.english_level;
        if (payload.btm_level) db.students[sIdx].default_btm_level = payload.btm_level;
        if (payload.ctm_level) db.students[sIdx].default_ctm_level = payload.ctm_level;
      }
    }

    // Sync homework in MockDB
    const hwIdx = db.homework.findIndex(h => h.class_update_id === id);
    if (payload.hw && payload.hw.trim()) {
      if (hwIdx !== -1) {
        db.homework[hwIdx] = {
          ...db.homework[hwIdx],
          homework_text: payload.hw.trim(),
          assigned_date: payload.class_date || db.homework[hwIdx].assigned_date,
          student_id: payload.student_id || db.homework[hwIdx].student_id,
          subject_id: payload.subject_id || db.homework[hwIdx].subject_id,
          updated_at: new Date().toISOString()
        };
      } else {
        db.homework.push({
          id: 'hw-' + Date.now(),
          student_id: payload.student_id || updated.student_id,
          class_update_id: id,
          subject_id: payload.subject_id || updated.subject_id,
          homework_text: payload.hw.trim(),
          assigned_date: payload.class_date || updated.class_date,
          checked: false
        });
      }
    } else if (payload.hw === '' && hwIdx !== -1 && !db.homework[hwIdx].checked) {
      db.homework.splice(hwIdx, 1);
    }

    saveMockDB(db);
    return { success: true };
  },

  // Delete Class Record (Admin)
  async deleteClassUpdate(id: string): Promise<{ success: boolean }> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('class_updates').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    }

    const db = getMockDB();
    db.class_updates = db.class_updates.filter(c => c.id !== id);
    db.homework = db.homework.filter(h => h.class_update_id !== id);
    saveMockDB(db);
    return { success: true };
  },

  // ==========================================
  // PARENT PROGRESS REPORT & FEEDBACK API
  // ==========================================

  // 1. Verify Parent Token & PIN and get Report Data
  async verifyParentAccess(token: string, pin: string): Promise<VerifyParentAccessResponse> {
    if (!token || !pin) {
      return { success: false, error: 'Token and PIN are required.' };
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.rpc('verify_parent_access', {
        p_token: token.trim(),
        p_pin: pin.trim(),
      });

      if (error) {
        return { success: false, error: error.message || 'Failed to verify parent access.' };
      }
      return data as VerifyParentAccessResponse;
    }

    // MockDB Verification
    const db = getMockDB();
    const cleanToken = token.trim();
    const cleanPin = pin.trim();

    const pa = db.parent_access.find(p => p.access_token === cleanToken);
    if (!pa || !pa.active) {
      return { 
        success: false, 
        error: 'This report link is inactive or invalid. Please contact your learning centre.' 
      };
    }

    // Check PIN (default '1234' or customized plain pin)
    const validPin = pa.pin_plain || '1234';
    if (cleanPin !== validPin) {
      return {
        success: false,
        error: 'Incorrect PIN. Please check and try again.'
      };
    }

    const student = db.students.find(s => s.id === pa.student_id);
    if (!student) {
      return { success: false, error: 'Student record not found.' };
    }

    // Build metrics & data
    const studentClasses = db.class_updates
      .filter(c => c.student_id === student.id)
      .sort((a, b) => new Date(b.class_date).getTime() - new Date(a.class_date).getTime());

    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const mtdClasses = studentClasses.filter(c => c.class_date.startsWith(currentMonthPrefix));

    const totalHours = Number((studentClasses.reduce((acc, c) => acc + c.duration_minutes, 0) / 60).toFixed(1));
    const mtdHours = Number((mtdClasses.reduce((acc, c) => acc + c.duration_minutes, 0) / 60).toFixed(1));

    const pendingHw = db.homework
      .filter(h => h.student_id === student.id && !h.checked)
      .map(h => {
        const history = (db.homework_status_history || [])
          .filter(sh => sh.homework_id === h.id)
          .map(sh => ({
            ...sh,
            instructor: db.instructors.find(i => i.id === sh.created_by),
            instructor_name: db.instructors.find(i => i.id === sh.created_by)?.name || 'Instructor'
          }))
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return {
          ...h,
          subject: db.subjects.find(s => s.id === h.subject_id),
          class_update: db.class_updates.find(c => c.id === h.class_update_id),
          status_history: history,
          latest_status: history[0] || null
        };
      })
      .sort((a, b) => new Date(b.assigned_date).getTime() - new Date(a.assigned_date).getTime());

    const completedHw = db.homework
      .filter(h => h.student_id === student.id && h.checked)
      .map(h => {
        const history = (db.homework_status_history || [])
          .filter(sh => sh.homework_id === h.id)
          .map(sh => ({
            ...sh,
            instructor: db.instructors.find(i => i.id === sh.created_by),
            instructor_name: db.instructors.find(i => i.id === sh.created_by)?.name || 'Instructor'
          }))
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return {
          ...h,
          subject: db.subjects.find(s => s.id === h.subject_id),
          instructor: db.instructors.find(i => i.id === h.checked_by),
          class_update: db.class_updates.find(c => c.id === h.class_update_id),
          status_history: history,
          latest_status: history[0] || null
        };
      })
      .sort((a, b) => new Date(b.checked_date || b.assigned_date).getTime() - new Date(a.checked_date || a.assigned_date).getTime())
      .slice(0, 10);

    const populatedClasses = studentClasses.slice(0, 15).map(c => ({
      ...c,
      subject: db.subjects.find(s => s.id === c.subject_id),
      instructor: db.instructors.find(i => i.id === c.instructor_id)
    }));

    return {
      success: true,
      report: {
        student: {
          id: student.id,
          name: student.name,
          english_level: student.default_english_level,
          btm_level: student.default_btm_level,
          ctm_level: student.default_ctm_level,
        },
        summary: {
          classes_this_month: mtdClasses.length,
          hours_this_month: mtdHours,
          total_classes: studentClasses.length,
          total_hours: totalHours,
          homework_completed: completedHw.length,
          homework_pending: pendingHw.length,
        },
        recent_classes: populatedClasses,
        pending_homework: pendingHw,
        completed_homework: completedHw,
        last_updated: studentClasses.length > 0 ? studentClasses[0].class_date : 'Recently'
      }
    };
  },

  // 2. Submit Parent Feedback
  async submitParentFeedback(params: SubmitParentFeedbackParams): Promise<{ success: boolean; message: string }> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.rpc('submit_parent_feedback', {
        p_token: params.token.trim(),
        p_pin: params.pin.trim(),
        p_rating: params.rating || null,
        p_feedback_text: params.feedback_text || null,
        p_contact_requested: params.contact_requested,
        p_contact_reason: params.contact_reason || null,
      });

      if (error) throw error;
      return data || { success: true, message: 'Thank you! Feedback received.' };
    }

    // MockDB submit
    const db = getMockDB();
    const pa = db.parent_access.find(p => p.access_token === params.token.trim());
    if (!pa) throw new Error('Invalid token');

    const newFeedback: ParentFeedback = {
      id: 'pf-' + Date.now(),
      student_id: pa.student_id,
      parent_access_id: pa.id,
      rating: params.rating || null,
      feedback_text: params.feedback_text || null,
      contact_requested: params.contact_requested,
      contact_reason: params.contact_reason || null,
      status: 'new',
      created_at: new Date().toISOString()
    };

    db.parent_feedback.unshift(newFeedback);
    saveMockDB(db);

    return { 
      success: true, 
      message: 'Thank you! Your feedback has been received by the learning centre.' 
    };
  },

  // 3. Admin: Get Parent Access Directory
  async adminGetParentAccessList(): Promise<ParentAccess[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('admin_get_parent_access_list');
        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map((item: any) => ({
            id: item.id || 'pa-' + item.student_id,
            student_id: item.student_id,
            student: {
              id: item.student_id,
              name: item.student_name || item.name || 'Student',
              active: item.student_active !== undefined ? item.student_active : true,
            },
            access_token: item.access_token || '',
            active: item.active !== undefined ? !!item.active : false,
            has_pin: item.has_pin !== undefined ? !!item.has_pin : false,
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || new Date().toISOString(),
            last_accessed_at: item.last_accessed_at || null,
          }));
        }
      } catch (rpcErr) {
        console.warn('admin_get_parent_access_list RPC not available, falling back to direct table query', rpcErr);
      }

      // Fallback: Query students and parent_access tables directly
      try {
        const [studRes, paRes] = await Promise.all([
          supabase.from('students').select('*').order('name'),
          supabase.from('parent_access').select('*'),
        ]);

        const studentsData: Student[] = studRes.data || [];
        const paData: any[] = paRes.data || [];

        return studentsData.map((s) => {
          const pa = paData.find((p: any) => p.student_id === s.id);
          return {
            id: pa?.id || 'pa-' + s.id,
            student_id: s.id,
            student: s,
            access_token: pa?.access_token || '',
            active: pa ? !!pa.active : false,
            has_pin: pa ? !!pa.pin_hash : false,
            created_at: pa?.created_at || s.created_at || new Date().toISOString(),
            updated_at: pa?.updated_at || s.updated_at || new Date().toISOString(),
            last_accessed_at: pa?.last_accessed_at || null,
          };
        });
      } catch (tableErr) {
        console.error('Failed to query parent_access table', tableErr);
      }
    }

    const db = getMockDB();
    return db.students.map(s => {
      const pa = db.parent_access.find(p => p.student_id === s.id);
      return {
        id: pa?.id || 'pa-' + s.id,
        student_id: s.id,
        student: s,
        access_token: pa?.access_token || '',
        active: pa ? pa.active : false,
        has_pin: pa ? true : false,
        created_at: pa?.created_at || s.created_at || new Date().toISOString(),
        updated_at: pa?.updated_at || s.updated_at || new Date().toISOString(),
        last_accessed_at: pa?.last_accessed_at || null,
      };
    });
  },

  // 4. Admin: Generate Parent Access Link
  async adminGenerateParentAccess(studentId: string, pin: string): Promise<{ success: boolean; access_token: string; message: string }> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.rpc('admin_generate_parent_access', {
        p_student_id: studentId,
        p_pin: pin.trim(),
      });
      if (error) throw error;
      return data;
    }

    const db = getMockDB();
    const token = 'token-' + Math.random().toString(36).substring(2, 12) + '-' + Date.now().toString(36);
    const existingIdx = db.parent_access.findIndex(p => p.student_id === studentId);

    if (existingIdx !== -1) {
      db.parent_access[existingIdx].access_token = token;
      db.parent_access[existingIdx].pin_plain = pin.trim();
      db.parent_access[existingIdx].active = true;
      db.parent_access[existingIdx].updated_at = new Date().toISOString();
    } else {
      db.parent_access.push({
        id: 'pa-' + Date.now(),
        student_id: studentId,
        access_token: token,
        pin_plain: pin.trim(),
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    saveMockDB(db);
    return { success: true, access_token: token, message: 'Parent access link generated successfully' };
  },

  // 4.1 Admin: Generate All Parent Access Links in Bulk
  async adminGenerateAllParentAccess(defaultPin: string = '1234'): Promise<{ success: boolean; count: number; message: string }> {
    const students = await this.getStudents();
    let count = 0;

    for (const student of students) {
      try {
        await this.adminGenerateParentAccess(student.id, defaultPin);
        count++;
      } catch (e) {
        console.warn(`Failed to generate parent access for ${student.name}`, e);
      }
    }

    return { 
      success: true, 
      count, 
      message: `Generated parent access links for ${count} students with default PIN ${defaultPin}.` 
    };
  },

  // 5. Admin: Change Parent PIN
  async adminChangeParentPin(studentId: string, newPin: string): Promise<{ success: boolean; message: string }> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.rpc('admin_change_parent_pin', {
        p_student_id: studentId,
        p_new_pin: newPin.trim(),
      });
      if (error) throw error;
      return data;
    }

    const db = getMockDB();
    const pa = db.parent_access.find(p => p.student_id === studentId);
    if (!pa) throw new Error('Parent access record not found for student');
    pa.pin_plain = newPin.trim();
    pa.updated_at = new Date().toISOString();
    saveMockDB(db);

    return { success: true, message: 'Parent PIN updated successfully' };
  },

  // 6. Admin: Toggle Parent Access Active / Revoked
  async adminToggleParentAccess(studentId: string, active: boolean): Promise<{ success: boolean; active: boolean; message: string }> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.rpc('admin_toggle_parent_access', {
        p_student_id: studentId,
        p_active: active,
      });
      if (error) throw error;
      return data;
    }

    const db = getMockDB();
    const pa = db.parent_access.find(p => p.student_id === studentId);
    if (pa) {
      pa.active = active;
      pa.updated_at = new Date().toISOString();
      saveMockDB(db);
    }
    return { 
      success: true, 
      active, 
      message: active ? 'Parent access enabled' : 'Parent access revoked' 
    };
  },

  // 7. Admin: Regenerate Parent Token (Invalidates old link)
  async adminRegenerateParentToken(studentId: string, pin?: string): Promise<{ success: boolean; access_token: string; message: string }> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.rpc('admin_regenerate_parent_token', {
        p_student_id: studentId,
        p_pin: pin ? pin.trim() : null,
      });
      if (error) throw error;
      return data;
    }

    const db = getMockDB();
    const token = 'token-' + Math.random().toString(36).substring(2, 12) + '-' + Date.now().toString(36);
    const pa = db.parent_access.find(p => p.student_id === studentId);
    if (pa) {
      pa.access_token = token;
      if (pin && pin.trim()) pa.pin_plain = pin.trim();
      pa.active = true;
      pa.updated_at = new Date().toISOString();
      saveMockDB(db);
    }
    return { success: true, access_token: token, message: 'New link generated (previous link invalidated)' };
  },

  // 8. Admin: Get Parent Feedback List
  async adminGetParentFeedbackList(): Promise<ParentFeedback[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.rpc('admin_get_parent_feedback_list');
      if (error) throw error;
      return data || [];
    }

    const db = getMockDB();
    return db.parent_feedback.map(pf => ({
      ...pf,
      student: db.students.find(s => s.id === pf.student_id),
      reviewer: pf.reviewed_by ? db.instructors.find(i => i.id === pf.reviewed_by) : undefined
    }));
  },

  // 9. Admin: Update Feedback Status
  async adminUpdateFeedbackStatus(feedbackId: string, status: ParentFeedbackStatus, adminNotes?: string): Promise<{ success: boolean }> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.rpc('admin_update_feedback_status', {
        p_feedback_id: feedbackId,
        p_status: status,
        p_admin_notes: adminNotes || null,
      });
      if (error) throw error;
      return data || { success: true };
    }

    const db = getMockDB();
    const pf = db.parent_feedback.find(p => p.id === feedbackId);
    if (pf) {
      pf.status = status;
      if (adminNotes !== undefined) pf.admin_notes = adminNotes;
      if (status === 'reviewed' && !pf.reviewed_at) pf.reviewed_at = new Date().toISOString();
      if (status === 'responded') pf.responded_at = new Date().toISOString();
      saveMockDB(db);
    }
    return { success: true };
  }
};



