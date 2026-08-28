import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { ClassUpdate, Student, Instructor, Subject } from '../types';
import { ClassDurationPicker } from './ClassDurationPicker';
import { LevelSelector } from './LevelSelector';
import { StudentSelect } from './StudentSelect';
import { 
  X, 
  Edit3, 
  Calendar, 
  Bookmark, 
  BookOpen, 
  Save, 
  AlertTriangle, 
  User 
} from 'lucide-react';

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  classUpdate: ClassUpdate | null;
  students: Student[];
  instructors: Instructor[];
  subjects: Subject[];
  isAdmin: boolean;
}

export const EditClassModal: React.FC<EditClassModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  classUpdate,
  students,
  instructors,
  subjects,
  isAdmin,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  
  const [englishLevel, setEnglishLevel] = useState<string>('H');
  const [btmLevel, setBtmLevel] = useState<string>('12');
  const [ctmLevel, setCtmLevel] = useState<string>('10');

  const [classDate, setClassDate] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [bookletNumber, setBookletNumber] = useState<string>('');
  const [cw, setCw] = useState<string>('');
  const [hw, setHw] = useState<string>('');

  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Populate state when classUpdate is loaded
  useEffect(() => {
    if (classUpdate) {
      setSelectedStudentId(classUpdate.student_id);
      setSelectedInstructorId(classUpdate.instructor_id);
      setSelectedSubjectId(classUpdate.subject_id);
      setEnglishLevel(classUpdate.english_level || 'None');
      setBtmLevel(classUpdate.btm_level || 'None');
      setCtmLevel(classUpdate.ctm_level || 'None');
      setClassDate(classUpdate.class_date);
      setDurationMinutes(classUpdate.duration_minutes || 60);
      setBookletNumber(classUpdate.booklet_number || '');
      setCw(classUpdate.cw || '');
      setHw(classUpdate.hw || '');
      setError(null);
    }
  }, [classUpdate]);

  if (!isOpen || !classUpdate) return null;

  const selectedSubjectObj = subjects.find(s => s.id === selectedSubjectId);
  const isMath = selectedSubjectObj?.name.toLowerCase() === 'math';
  const activeInstructorObj = instructors.find(i => i.id === selectedInstructorId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedInstructorId || !selectedSubjectId || !classDate) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await api.updateClassUpdate(classUpdate.id, {
        student_id: selectedStudentId,
        instructor_id: selectedInstructorId,
        subject_id: selectedSubjectId,
        english_level: !isMath ? englishLevel : undefined,
        btm_level: isMath ? btmLevel : undefined,
        ctm_level: isMath ? ctmLevel : undefined,
        class_date: classDate,
        duration_minutes: durationMinutes,
        booklet_number: bookletNumber.trim() || null,
        cw: cw.trim() || null,
        hw: hw.trim() || null,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update class record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Edit Class Record</h3>
              <p className="text-xs text-slate-500">
                Updating class on {classDate} for {classUpdate.student?.name || 'Student'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Instructor & Student */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Instructor */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instructor {isAdmin && <span className="text-sky-600 text-[11px] font-normal">(Admin editable)</span>}
              </label>
              {isAdmin ? (
                <select
                  value={selectedInstructorId}
                  onChange={(e) => setSelectedInstructorId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  {instructors.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 font-medium">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{activeInstructorObj?.name || 'Instructor'}</span>
                </div>
              )}
            </div>

            {/* Student */}
            <div>
              <StudentSelect
                students={students}
                selectedStudentId={selectedStudentId}
                onChange={setSelectedStudentId}
                required
              />
            </div>
          </div>

          {/* Section 2: Subject & Levels */}
          <div className="pt-1">
            <div className="mb-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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

          {/* Section 3: Date, Duration, Booklet */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                  required
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <ClassDurationPicker
                value={durationMinutes}
                onChange={setDurationMinutes}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Booklet Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Bookmark className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. 15-6"
                  value={bookletNumber}
                  onChange={(e) => setBookletNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: CW & HW */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Classwork (CW)
              </label>
              <textarea
                rows={2}
                placeholder="Topics and pages completed..."
                value={cw}
                onChange={(e) => setCw(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Homework (HW)
              </label>
              <textarea
                rows={2}
                placeholder="Homework instructions..."
                value={hw}
                onChange={(e) => setHw(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
