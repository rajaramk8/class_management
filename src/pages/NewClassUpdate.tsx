import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Student, Subject, Level, Homework, Instructor } from '../types';
import { StudentSelect } from '../components/StudentSelect';
import { ClassDurationPicker } from '../components/ClassDurationPicker';
import { PendingHomeworkList } from '../components/PendingHomeworkList';
import { LevelSelector } from '../components/LevelSelector';
import { 
  Calendar, 
  BookOpen, 
  Bookmark, 
  Send, 
  CheckCircle2, 
  AlertTriangle,
  User,
  History
} from 'lucide-react';
import { format } from 'date-fns';

export const NewClassUpdate: React.FC = () => {
  const { user, currentInstructor } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Master lists
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  // Form states
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  
  // Level states for English & Math (BTM / CTM)
  const [englishLevel, setEnglishLevel] = useState<string>('H');
  const [btmLevel, setBtmLevel] = useState<string>('12');
  const [ctmLevel, setCtmLevel] = useState<string>('10');

  const [classDate, setClassDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [bookletNumber, setBookletNumber] = useState<string>('');
  const [cw, setCw] = useState<string>('');
  const [hw, setHw] = useState<string>('');

  // Pending homework & checkbox selections
  const [pendingHomework, setPendingHomework] = useState<Homework[]>([]);
  const [selectedHwIds, setSelectedHwIds] = useState<string[]>([]);
  const [loadingPendingHw, setLoadingPendingHw] = useState<boolean>(false);
  const [filterAllSubjects, setFilterAllSubjects] = useState<boolean>(false);

  // Status & Feedback
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // 1. Initial Load Master Data
  useEffect(() => {
    async function loadMasterData() {
      try {
        setLoading(true);
        const [studs, subs, insts] = await Promise.all([
          api.getStudents(),
          api.getSubjects(),
          api.getInstructors(),
        ]);

        setStudents(studs);
        setSubjects(subs);
        setInstructors(insts);

        // Default Subject to Math or first available
        if (subs.length > 0) {
          const mathSub = subs.find(s => s.name.toLowerCase() === 'math') || subs[0];
          setSelectedSubjectId(mathSub.id);
        }

        // Determine initial instructor:
        const queryInstructor = searchParams.get('instructor');
        let initialInstId = currentInstructor?.id || '';

        if (!initialInstId && queryInstructor) {
          const match = insts.find(i => i.name.toLowerCase() === queryInstructor.toLowerCase());
          if (match) initialInstId = match.id;
        }

        if (!initialInstId && insts.length > 0) {
          initialInstId = insts[0].id;
        }

        setSelectedInstructorId(initialInstId);
      } catch (err: any) {
        setError(err.message || 'Failed to load master data');
      } finally {
        setLoading(false);
      }
    }

    loadMasterData();
  }, [currentInstructor, searchParams]);

  // 2. When Student is selected, auto pre-populate their previous / remembered level details
  useEffect(() => {
    async function prefillStudentLevels() {
      if (!selectedStudentId) return;

      try {
        const lastLevels = await api.getStudentLastLevels(selectedStudentId);
        if (lastLevels.english_level) {
          setEnglishLevel(lastLevels.english_level);
        }
        if (lastLevels.btm_level) {
          setBtmLevel(lastLevels.btm_level);
        }
        if (lastLevels.ctm_level) {
          setCtmLevel(lastLevels.ctm_level);
        }
      } catch (err) {
        console.error('Error pre-filling student levels', err);
      }
    }

    prefillStudentLevels();
  }, [selectedStudentId]);

  // 3. Automatically Fetch Pending Homework when Student, Class Date, or Subject changes
  useEffect(() => {
    async function fetchPending() {
      if (!selectedStudentId || !classDate) {
        setPendingHomework([]);
        setSelectedHwIds([]);
        return;
      }

      try {
        setLoadingPendingHw(true);
        const subjectFilter = filterAllSubjects ? undefined : selectedSubjectId;
        const list = await api.getPendingHomework(selectedStudentId, classDate, subjectFilter);
        setPendingHomework(list);
        setSelectedHwIds([]); // reset selection
      } catch (err: any) {
        console.error('Failed to fetch pending homework', err);
      } finally {
        setLoadingPendingHw(false);
      }
    }

    fetchPending();
  }, [selectedStudentId, classDate, selectedSubjectId, filterAllSubjects]);

  // Checkbox handlers
  const handleToggleHw = (id: string) => {
    setSelectedHwIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleAllHw = () => {
    if (selectedHwIds.length === pendingHomework.length) {
      setSelectedHwIds([]);
    } else {
      setSelectedHwIds(pendingHomework.map(h => h.id));
    }
  };

  // 4. Form Submit Handler (Atomic Transaction)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setDuplicateWarning(null);

    if (!selectedStudentId) {
      setError('Please select a student.');
      return;
    }
    if (!selectedInstructorId) {
      setError('Please select an instructor.');
      return;
    }
    if (!selectedSubjectId) {
      setError('Please select a subject.');
      return;
    }

    const currentSubject = subjects.find(s => s.id === selectedSubjectId);
    const isMath = currentSubject?.name.toLowerCase() === 'math';

    try {
      setSaving(true);

      // Duplicate Check Warning (Requirement Section 12)
      const isDuplicate = await api.checkDuplicateClass(
        selectedStudentId,
        selectedInstructorId,
        selectedSubjectId,
        classDate
      );

      if (isDuplicate) {
        setDuplicateWarning(
          `A class update for this student, instructor, and subject already exists on ${classDate}. Please verify before proceeding.`
        );
        setSaving(false);
        return;
      }

      // Execute Atomic Save RPC with English / Math BTM & CTM levels
      const result = await api.saveClassUpdate({
        student_id: selectedStudentId,
        instructor_id: selectedInstructorId,
        subject_id: selectedSubjectId,
        english_level: !isMath ? englishLevel : undefined,
        btm_level: isMath ? btmLevel : undefined,
        ctm_level: isMath ? ctmLevel : undefined,
        class_date: classDate,
        duration_minutes: durationMinutes,
        booklet_number: bookletNumber,
        cw: cw,
        hw: hw,
        checked_homework_ids: selectedHwIds,
      });

      if (result.success) {
        const studentName = students.find(s => s.id === selectedStudentId)?.name || 'Student';
        const levelSummary = isMath 
          ? `(BTM Level ${btmLevel}, CTM Level ${ctmLevel})` 
          : `(Level ${englishLevel})`;

        setSuccessMessage(
          `Class update for ${studentName} ${levelSummary} successfully saved! (${selectedHwIds.length} previous homework marked as checked)`
        );

        // Reset form for next entry
        setCw('');
        setHw('');
        setBookletNumber('');
        setSelectedHwIds([]);
        setPendingHomework([]);
        setSelectedStudentId('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save class update');
    } finally {
      setSaving(false);
    }
  };

  const activeInstructorObj = instructors.find(i => i.id === selectedInstructorId);
  const selectedSubjectObj = subjects.find(s => s.id === selectedSubjectId);
  const selectedStudentObj = students.find(s => s.id === selectedStudentId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-3"></div>
          <p className="text-sm text-slate-500">Loading form options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Top Banner / Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">New Class Update</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Record class details, assign new homework, and review previous unchecked assignments in one step.
        </p>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-emerald-950">Record Saved Successfully</h4>
            <p className="text-sm text-emerald-800 mt-0.5">{successMessage}</p>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            View History
          </button>
        </div>
      )}

      {/* Duplicate Warning Modal / Banner */}
      {duplicateWarning && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-amber-950">Potential Duplicate Record</h4>
            <p className="text-sm text-amber-800 mt-1">{duplicateWarning}</p>
          </div>
          <button
            type="button"
            onClick={() => setDuplicateWarning(null)}
            className="text-xs text-amber-700 hover:text-amber-900 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-rose-950">Save Failed</h4>
            <p className="text-sm text-rose-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        
        {/* Section 1: Instructor & Student Header */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Instructor Field (Prefilled from Auth / URL) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Instructor
              </label>
              {user?.role === 'admin' ? (
                <div className="relative">
                  <select
                    value={selectedInstructorId}
                    onChange={(e) => setSelectedInstructorId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    {instructors.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-medium">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{activeInstructorObj?.name || user?.full_name || 'Instructor'}</span>
                </div>
              )}
            </div>

            {/* Student Search & Select */}
            <div>
              <StudentSelect
                students={students}
                selectedStudentId={selectedStudentId}
                onChange={setSelectedStudentId}
                required
              />
            </div>
          </div>

          <div className="pt-2">
            {/* Subject Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Subject
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Level Selector: Dynamic based on English or Math (BTM & CTM) */}
            <LevelSelector
              subjectName={selectedSubjectObj?.name || 'Math'}
              englishLevel={englishLevel}
              btmLevel={btmLevel}
              ctmLevel={ctmLevel}
              onEnglishLevelChange={setEnglishLevel}
              onBtmLevelChange={setBtmLevel}
              onCtmLevelChange={setCtmLevel}
            />
          </div>
        </div>

        {/* Section 2: Date, Duration, Booklet */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Class Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Class Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  value={classDate}
                  onChange={(e) => setClassDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </div>
            </div>

            {/* Class Duration Combobox */}
            <div>
              <ClassDurationPicker
                value={durationMinutes}
                onChange={setDurationMinutes}
              />
            </div>

            {/* Booklet Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Booklet Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Bookmark className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. 15-6 or Booklet 12"
                  value={bookletNumber}
                  onChange={(e) => setBookletNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Classwork & Homework Inputs */}
        <div className="p-6 space-y-4">
          {/* Classwork (CW) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              CW (Classwork Details)
            </label>
            <textarea
              rows={3}
              placeholder="Enter topics, booklet pages, exercises completed during class..."
              value={cw}
              onChange={(e) => setCw(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          {/* Homework (HW) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center justify-between">
              <span>HW (Assigned Homework)</span>
              <span className="text-xs text-slate-400 font-normal">Creates a trackable homework assignment</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. 15-6 Pages 7, 11, 13, 14, 15"
              value={hw}
              onChange={(e) => setHw(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>

        {/* Section 4: Previous Pending Homework Review Box (Prominently displayed) */}
        <div className="p-6 bg-slate-50/70 border-t border-slate-200">
          <PendingHomeworkList
            student={selectedStudentObj}
            subject={selectedSubjectObj}
            pendingHomework={pendingHomework}
            selectedIds={selectedHwIds}
            onToggle={handleToggleHw}
            onToggleAll={handleToggleAllHw}
            loading={loadingPendingHw}
            filterAllSubjects={filterAllSubjects}
            onToggleSubjectFilter={() => setFilterAllSubjects(!filterAllSubjects)}
          />
        </div>

        {/* Action Button Footer */}
        <div className="p-6 bg-slate-50 flex items-center justify-between rounded-b-2xl">
          <div className="text-xs text-slate-500">
            {selectedHwIds.length > 0 ? (
              <span className="font-semibold text-emerald-700">
                ✓ {selectedHwIds.length} pending homework item{selectedHwIds.length > 1 ? 's' : ''} will be marked as checked upon save
              </span>
            ) : (
              <span>No previous homework selected to check off</span>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || !selectedStudentId}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Saving Record...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Save Class Update</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
