import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Student, Instructor } from '../types';
import { 
  ENGLISH_LEVELS_DISPLAY_ORDER, 
  MATH_BTM_LEVELS_DISPLAY_ORDER,
  MATH_CTM_LEVELS_DISPLAY_ORDER 
} from '../constants/levels';
import { 
  Users, 
  UserPlus, 
  BookOpen, 
  Layers, 
  Calculator,
  Brain,
  Plus, 
  ShieldCheck, 
  Edit3,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const AdminManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'students' | 'instructors' | 'curriculum'>('students');

  // Master Data
  const [students, setStudents] = useState<Student[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  // New Student Form States
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentNotes, setNewStudentNotes] = useState('');
  const [newStudentEnglishLevel, setNewStudentEnglishLevel] = useState('H');
  const [newStudentBtmLevel, setNewStudentBtmLevel] = useState('12');
  const [newStudentCtmLevel, setNewStudentCtmLevel] = useState('10');

  // New Instructor Form States
  const [newInstructorName, setNewInstructorName] = useState('');
  const [newInstructorEmail, setNewInstructorEmail] = useState('');

  // Editing Student Levels Modal / inline
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editEngLevel, setEditEngLevel] = useState<string>('');
  const [editBtmLevel, setEditBtmLevel] = useState<string>('');
  const [editCtmLevel, setEditCtmLevel] = useState<string>('');

  // Admin Set Instructor Password Modal States
  const [passwordModalInstructor, setPasswordModalInstructor] = useState<Instructor | null>(null);
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState<string | null>(null);
  const [passwordResetError, setPasswordResetError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [st, inst] = await Promise.all([
        api.getStudents(),
        api.getInstructors(),
      ]);
      setStudents(st);
      setInstructors(inst);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    try {
      setSaving(true);
      await api.createStudent({
        name: newStudentName.trim(),
        notes: newStudentNotes.trim() || undefined,
        default_english_level: newStudentEnglishLevel,
        default_btm_level: newStudentBtmLevel,
        default_ctm_level: newStudentBtmLevel === 'Summit' ? 'X' : (newStudentBtmLevel === 'None' ? 'None' : newStudentCtmLevel),
        active: true,
      });
      setNewStudentName('');
      setNewStudentNotes('');
      await loadAll();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStudentActive = async (student: Student) => {
    try {
      await api.updateStudent(student.id, { active: !student.active });
      await loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const startEditStudent = (s: Student) => {
    setEditingStudentId(s.id);
    setEditEngLevel(s.default_english_level || 'None');
    setEditBtmLevel(s.default_btm_level || 'None');
    setEditCtmLevel(s.default_ctm_level || 'None');
  };

  const saveStudentLevels = async (studentId: string) => {
    try {
      await api.updateStudent(studentId, {
        default_english_level: editEngLevel,
        default_btm_level: editBtmLevel,
        default_ctm_level: editBtmLevel === 'Summit' ? 'X' : (editBtmLevel === 'None' ? 'None' : editCtmLevel),
      });
      setEditingStudentId(null);
      await loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstructorName.trim()) return;
    try {
      setSaving(true);
      await api.createInstructor({
        name: newInstructorName.trim(),
        email: newInstructorEmail.trim() || undefined,
        active: true,
      });
      setNewInstructorName('');
      setNewInstructorEmail('');
      await loadAll();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Generate strong random password
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAdminNewPassword(pass);
  };

  const handleCopyPassword = () => {
    if (adminNewPassword) {
      navigator.clipboard.writeText(adminNewPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAdminResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalInstructor?.email || !adminNewPassword) return;

    try {
      setPasswordResetLoading(true);
      setPasswordResetError(null);
      setPasswordResetSuccess(null);

      const res = await api.adminSetInstructorPassword(passwordModalInstructor.email, adminNewPassword);
      setPasswordResetSuccess(res.message || `Password for ${passwordModalInstructor.name} updated!`);
    } catch (err: any) {
      console.error(err);
      setPasswordResetError(err.message || 'Failed to update password. Make sure user exists in Supabase Auth.');
    } finally {
      setPasswordResetLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-3"></div>
          <p className="text-sm text-slate-500">Loading admin configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8">
      {/* Title */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600" />
          Master Data Administration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure students, default levels, instructors, password resets, and curriculum.
        </p>
      </div>

      {/* Navigation Tabs (Scrollable on Mobile) */}
      <div className="flex gap-1 sm:gap-2 border-b border-slate-200 mb-4 sm:mb-6 overflow-x-auto whitespace-nowrap pb-1">
        <button
          onClick={() => setActiveTab('students')}
          className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'students'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Students & Levels ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('instructors')}
          className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'instructors'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Instructors & Passwords ({instructors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('curriculum')}
          className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'curriculum'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Curriculum & Levels</span>
        </button>
      </div>

      {/* Tab 1: Students */}
      {activeTab === 'students' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Student Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-fit space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-sky-600" />
              Add New Student
            </h3>
            <form onSubmit={handleAddStudent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diya Nair"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              {/* Initial Level Defaults */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <span className="block text-xs font-bold text-slate-700">Initial Level Assignment</span>
                
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-0.5">English Level</label>
                  <select
                    value={newStudentEnglishLevel}
                    onChange={(e) => setNewStudentEnglishLevel(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs"
                  >
                    <option value="None">🚫 None (Not Enrolled in English)</option>
                    <optgroup label="English Levels (8 → Pre-A)">
                      {ENGLISH_LEVELS_DISPLAY_ORDER.map(l => (
                        <option key={l} value={l}>Level {l}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Math BTM</label>
                    <select
                      value={newStudentBtmLevel}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewStudentBtmLevel(val);
                        if (val === 'Summit') {
                          setNewStudentCtmLevel('X');
                        } else if (val === 'None') {
                          setNewStudentCtmLevel('None');
                        } else if (newStudentCtmLevel === 'None') {
                          setNewStudentCtmLevel('10');
                        }
                      }}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs"
                    >
                      <option value="None">🚫 None (Not Enrolled)</option>
                      <optgroup label="Special Product">
                        <option value="Summit">⭐ Summit</option>
                      </optgroup>
                      <optgroup label="BTM Levels (32 → 1)">
                        {MATH_BTM_LEVELS_DISPLAY_ORDER.filter(l => l !== 'Summit').map(l => (
                          <option key={l} value={l}>BTM {l}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Math CTM</label>
                    <select
                      value={newStudentBtmLevel === 'Summit' ? 'X' : (newStudentBtmLevel === 'None' ? 'None' : newStudentCtmLevel)}
                      disabled={newStudentBtmLevel === 'Summit' || newStudentBtmLevel === 'None'}
                      onChange={(e) => setNewStudentCtmLevel(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      <option value="None">None (Not Enrolled)</option>
                      <optgroup label="CTM Levels (32 → 1)">
                        {MATH_CTM_LEVELS_DISPLAY_ORDER.filter(l => l !== 'X').map(l => (
                          <option key={l} value={l}>CTM {l}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Special">
                        <option value="X">X (N/A / Summit)</option>
                      </optgroup>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Special instructions or target goals..."
                  value={newStudentNotes}
                  onChange={(e) => setNewStudentNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving || !newStudentName.trim()}
                className="w-full py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Student
              </button>
            </form>
          </div>

          {/* Student List */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Student Master & Default Levels</h3>
                <p className="text-xs text-slate-500">Levels automatically pre-fill in the class insert screen</p>
              </div>
              <span className="text-xs font-medium text-slate-600">{students.filter(s => s.active).length} Active</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {students.map((student) => (
                <div key={student.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{student.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          student.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {student.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {/* Default Levels Badges */}
                      {editingStudentId === student.id ? (
                        <div className="mt-3 bg-sky-50 p-3 rounded-lg border border-sky-200 space-y-2">
                          <span className="block text-xs font-bold text-sky-900">Edit Student Levels</span>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-600 block">English</label>
                              <select
                                value={editEngLevel}
                                onChange={(e) => setEditEngLevel(e.target.value)}
                                className="w-full text-xs p-1 bg-white border border-slate-300 rounded"
                              >
                                <option value="None">None (Not Enrolled)</option>
                                {ENGLISH_LEVELS_DISPLAY_ORDER.map(l => (
                                  <option key={l} value={l}>Level {l}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-600 block">BTM Math</label>
                              <select
                                value={editBtmLevel}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditBtmLevel(val);
                                  if (val === 'Summit') {
                                    setEditCtmLevel('X');
                                  } else if (val === 'None') {
                                    setEditCtmLevel('None');
                                  } else if (editCtmLevel === 'None') {
                                    setEditCtmLevel('10');
                                  }
                                }}
                                className="w-full text-xs p-1 bg-white border border-slate-300 rounded"
                              >
                                <option value="None">None (Not Enrolled)</option>
                                {MATH_BTM_LEVELS_DISPLAY_ORDER.map(l => (
                                  <option key={l} value={l}>
                                    {l === 'Summit' ? '⭐ Summit' : `BTM ${l}`}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-600 block">CTM Math</label>
                              <select
                                value={editBtmLevel === 'Summit' ? 'X' : (editBtmLevel === 'None' ? 'None' : editCtmLevel)}
                                disabled={editBtmLevel === 'Summit' || editBtmLevel === 'None'}
                                onChange={(e) => setEditCtmLevel(e.target.value)}
                                className="w-full text-xs p-1 bg-white border border-slate-300 rounded disabled:bg-slate-100 disabled:text-slate-500"
                              >
                                <option value="None">None (Not Enrolled)</option>
                                {MATH_CTM_LEVELS_DISPLAY_ORDER.map(l => (
                                  <option key={l} value={l}>
                                    {l === 'X' ? 'X (N/A)' : `CTM ${l}`}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => saveStudentLevels(student.id)}
                              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs font-semibold"
                            >
                              Save Levels
                            </button>
                            <button
                              onClick={() => setEditingStudentId(null)}
                              className="px-2 py-1 text-slate-600 hover:text-slate-900 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {/* English Badge */}
                          {(!student.default_english_level || student.default_english_level === 'None') ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              English: Not Enrolled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              English: Level {student.default_english_level}
                            </span>
                          )}

                          {/* Math Badges */}
                          {(!student.default_btm_level || student.default_btm_level === 'None') ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              Math: Not Enrolled
                            </span>
                          ) : (
                            <>
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                                {student.default_btm_level === 'Summit' ? '⭐ BTM: Summit' : `BTM Level ${student.default_btm_level}`}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                {student.default_ctm_level === 'X' ? 'CTM: X' : `CTM Level ${student.default_ctm_level || '10'}`}
                              </span>
                            </>
                          )}
                        </div>
                      )}

                      {student.notes && <p className="text-xs text-slate-500 mt-1.5">{student.notes}</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {editingStudentId !== student.id && (
                        <button
                          onClick={() => startEditStudent(student)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Student Default Levels"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleStudentActive(student)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
                          student.active
                            ? 'border-slate-300 text-slate-600 hover:bg-slate-100'
                            : 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                      >
                        {student.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Instructors & Password Management */}
      {activeTab === 'instructors' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-fit">
            <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-sky-600" />
              Add Instructor
            </h3>
            <form onSubmit={handleAddInstructor} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Instructor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={newInstructorName}
                  onChange={(e) => setNewInstructorName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="priya@example.com"
                  value={newInstructorEmail}
                  onChange={(e) => setNewInstructorEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={saving || !newInstructorName.trim()}
                className="w-full py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Instructor
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Instructor Master List & Security</h3>
                <p className="text-xs text-slate-500">Admins can update or reset passwords for any instructor</p>
              </div>
              <span className="text-xs text-slate-500">{instructors.length} Instructors</span>
            </div>
            <div className="divide-y divide-slate-100">
              {instructors.map((inst) => (
                <div key={inst.id} className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900 text-sm">{inst.name}</h4>
                      <span className="inline-flex items-center text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{inst.email || 'No email specified'}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {inst.email && (
                      <button
                        onClick={() => {
                          setPasswordModalInstructor(inst);
                          setAdminNewPassword('');
                          setPasswordResetSuccess(null);
                          setPasswordResetError(null);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
                        title="Set / Reset Password"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-sky-600" />
                        <span>Set Password</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Curriculum (Subjects & Levels in Reverse Display) */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* English Levels (Reverse Order: 8 -> Pre-A) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-emerald-50/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-bold text-emerald-950 text-sm">English Levels</h3>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  8 → Pre-A (Reverse)
                </span>
              </div>
              <div className="p-3 max-h-96 overflow-y-auto space-y-1.5">
                {ENGLISH_LEVELS_DISPLAY_ORDER.map((lvl, idx) => (
                  <div key={lvl} className="px-3 py-2 bg-slate-50 hover:bg-emerald-50 rounded-lg flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Level {lvl}</span>
                    <span className="text-slate-400">Position #{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Math BTM Levels (Summit + 32 -> 1) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-sky-50/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-sky-700" />
                  <h3 className="font-bold text-sky-950 text-sm">Math: BTM Levels</h3>
                </div>
                <span className="text-[11px] font-semibold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                  Summit + 32 → 1
                </span>
              </div>
              <div className="p-3 max-h-96 overflow-y-auto space-y-1.5">
                {MATH_BTM_LEVELS_DISPLAY_ORDER.map((lvl) => (
                  <div key={`btm-${lvl}`} className={`px-3 py-2 rounded-lg flex items-center justify-between text-xs ${
                    lvl === 'Summit' ? 'bg-amber-50 text-amber-950 border border-amber-200 font-bold' : 'bg-slate-50 hover:bg-sky-50 text-slate-800'
                  }`}>
                    <span>{lvl === 'Summit' ? '⭐ Summit (Special Product)' : `BTM Level ${lvl}`}</span>
                    <span className="text-slate-400">{lvl === 'Summit' ? 'Product' : `Level #${lvl}`}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Math CTM Levels (32 -> 1 + X) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-indigo-50/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-700" />
                  <h3 className="font-bold text-indigo-950 text-sm">Math: CTM Levels</h3>
                </div>
                <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                  32 → 1 + X
                </span>
              </div>
              <div className="p-3 max-h-96 overflow-y-auto space-y-1.5">
                {MATH_CTM_LEVELS_DISPLAY_ORDER.map((lvl) => (
                  <div key={`ctm-${lvl}`} className={`px-3 py-2 rounded-lg flex items-center justify-between text-xs ${
                    lvl === 'X' ? 'bg-slate-100 text-slate-700 border border-slate-200 font-semibold' : 'bg-slate-50 hover:bg-indigo-50 text-slate-800'
                  }`}>
                    <span>{lvl === 'X' ? 'X (N/A / Summit)' : `CTM Level ${lvl}`}</span>
                    <span className="text-slate-400">{lvl === 'X' ? 'Special' : `Level #${lvl}`}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Admin Set Password Modal */}
      {passwordModalInstructor && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setPasswordModalInstructor(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Set Instructor Password</h3>
                <p className="text-xs text-slate-500">
                  Update password for <span className="font-semibold text-slate-800">{passwordModalInstructor.name}</span> ({passwordModalInstructor.email})
                </p>
              </div>
            </div>

            {passwordResetError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{passwordResetError}</span>
              </div>
            )}

            {passwordResetSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{passwordResetSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAdminResetPassword} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    New Password
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-xs text-sky-600 hover:text-sky-700 font-semibold inline-flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Auto-Generate
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter new password (min 6 chars)..."
                    value={adminNewPassword}
                    onChange={(e) => setAdminNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none pr-16 font-mono"
                  />
                  <div className="absolute right-2 top-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="p-1 text-slate-400 hover:text-slate-600"
                      title="Copy Password"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalInstructor(null)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={passwordResetLoading || !adminNewPassword}
                  className="flex-1 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  {passwordResetLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    'Set Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
