import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Student, Instructor, ParentAccess, ParentFeedback, ParentFeedbackStatus } from '../types';
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
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Share2,
  Lock,
  RefreshCw,
  PhoneCall,
  Search
} from 'lucide-react';

export const AdminManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'students' | 'instructors' | 'parent_access' | 'parent_feedback' | 'curriculum'>('students');

  // Master Data
  const [students, setStudents] = useState<Student[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [parentAccessList, setParentAccessList] = useState<ParentAccess[]>([]);
  const [parentFeedbackList, setParentFeedbackList] = useState<ParentFeedback[]>([]);

  // Search & Filter States
  const [parentSearch, setParentSearch] = useState('');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<'all' | 'new' | 'reviewed' | 'responded'>('all');

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

  // Parent PIN Modal States
  const [pinModalData, setPinModalData] = useState<{ studentId: string; studentName: string } | null>(null);
  const [parentPinInput, setParentPinInput] = useState('1234');
  const [parentPinLoading, setParentPinLoading] = useState(false);
  const [parentPinSuccess, setParentPinSuccess] = useState<string | null>(null);
  const [parentPinError, setParentPinError] = useState<string | null>(null);

  // Copy Feedback state map
  const [copiedTokenMap, setCopiedTokenMap] = useState<Record<string, boolean>>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [st, inst, paList, fbList] = await Promise.all([
        api.getStudents(),
        api.getInstructors(),
        api.adminGetParentAccessList().catch(() => []),
        api.adminGetParentFeedbackList().catch(() => []),
      ]);
      setStudents(st);
      setInstructors(inst);
      setParentAccessList(paList);
      setParentFeedbackList(fbList);
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
      alert('Failed to add student');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEditLevels = (s: Student) => {
    setEditingStudentId(s.id);
    setEditEngLevel(s.default_english_level || 'H');
    setEditBtmLevel(s.default_btm_level || '12');
    setEditCtmLevel(s.default_ctm_level || '10');
  };

  const handleSaveLevels = async (studentId: string) => {
    try {
      setSaving(true);
      await api.updateStudent(studentId, {
        default_english_level: editEngLevel,
        default_btm_level: editBtmLevel,
        default_ctm_level: editBtmLevel === 'Summit' ? 'X' : (editBtmLevel === 'None' ? 'None' : editCtmLevel),
      });
      setEditingStudentId(null);
      await loadAll();
    } catch (err) {
      console.error(err);
      alert('Failed to update student levels');
    } finally {
      setSaving(false);
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
      alert('Failed to add instructor');
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

  // =========================================================================
  // PARENT ACCESS HANDLERS
  // =========================================================================

  const getFullParentUrl = (token: string) => {
    return `${window.location.origin}/parent/${token}`;
  };

  const handleCopyParentLink = (token: string, studentId: string) => {
    const url = getFullParentUrl(token);
    navigator.clipboard.writeText(url);
    setCopiedTokenMap(prev => ({ ...prev, [studentId]: true }));
    setTimeout(() => {
      setCopiedTokenMap(prev => ({ ...prev, [studentId]: false }));
    }, 2000);
  };

  const handleShareWhatsApp = (token: string, studentName: string) => {
    const url = getFullParentUrl(token);
    const msg = `Dear Parent, here is the learning progress report link for ${studentName}:\n\n${url}\n\nPlease enter your 4-digit security PIN to view.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleGenerateAccess = async (studentId: string) => {
    try {
      setSaving(true);
      await api.adminGenerateParentAccess(studentId, '1234');
      await loadAll();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to generate parent access link.');
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateToken = async (studentId: string, studentName: string) => {
    if (!window.confirm(`Regenerate parent link for ${studentName}? This will immediately invalidate the previous link.`)) {
      return;
    }
    try {
      setSaving(true);
      await api.adminRegenerateParentToken(studentId);
      await loadAll();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to regenerate link.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAccess = async (studentId: string, currentActive: boolean) => {
    try {
      setSaving(true);
      await api.adminToggleParentAccess(studentId, !currentActive);
      await loadAll();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to update access status.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenPinModal = (studentId: string, studentName: string) => {
    setPinModalData({ studentId, studentName });
    setParentPinInput('1234');
    setParentPinError(null);
    setParentPinSuccess(null);
  };

  const handleSaveParentPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinModalData || !parentPinInput) return;

    if (parentPinInput.length < 4) {
      setParentPinError('PIN must be at least 4 characters/digits.');
      return;
    }

    try {
      setParentPinLoading(true);
      setParentPinError(null);
      await api.adminChangeParentPin(pinModalData.studentId, parentPinInput);
      setParentPinSuccess(`Security PIN for ${pinModalData.studentName} updated successfully!`);
      await loadAll();
      setTimeout(() => {
        setPinModalData(null);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setParentPinError(err.message || 'Failed to update PIN.');
    } finally {
      setParentPinLoading(false);
    }
  };

  const handleUpdateFeedbackStatus = async (feedbackId: string, status: ParentFeedbackStatus, notes?: string) => {
    try {
      await api.adminUpdateFeedbackStatus(feedbackId, status, notes);
      await loadAll();
    } catch (err: any) {
      console.error(err);
      alert('Failed to update feedback status.');
    }
  };

  const handleGenerateAllAccess = async () => {
    if (!window.confirm('Generate parent access links for all students with default PIN 1234?')) return;
    try {
      setSaving(true);
      const res = await api.adminGenerateAllParentAccess('1234');
      alert(res.message || 'Parent links generated for all students!');
      await loadAll();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to generate links in bulk.');
    } finally {
      setSaving(false);
    }
  };

  // Filtered list ensuring EVERY student is always visible
  const displayParentList = students.map(student => {
    const pa = parentAccessList.find(p => p.student_id === student.id);
    return {
      student,
      student_id: student.id,
      access_token: pa?.access_token || '',
      active: pa ? pa.active : false,
      has_pin: pa ? pa.has_pin : false,
      last_accessed_at: pa?.last_accessed_at || null,
    };
  }).filter(item => item.student.name.toLowerCase().includes(parentSearch.toLowerCase()));

  const newFeedbackCount = parentFeedbackList.filter(f => f.status === 'new').length;

  const filteredFeedback = parentFeedbackList.filter(f => {
    if (feedbackStatusFilter !== 'all' && f.status !== feedbackStatusFilter) return false;
    return true;
  });

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
          Master Data & Parent Administration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure students, default levels, instructors, parent progress links, PINs, and feedback inbox.
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
          onClick={() => setActiveTab('parent_access')}
          className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'parent_access'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Parent Links & PINs ({parentAccessList.filter(p => p.active).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('parent_feedback')}
          className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 relative ${
            activeTab === 'parent_feedback'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Parent Feedback</span>
          {newFeedbackCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
              {newFeedbackCount} New
            </span>
          )}
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

      {/* ========================================================================= */}
      {/* TAB 1: STUDENTS & LEVELS */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Student Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs h-fit space-y-4">
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
                  placeholder="e.g. Liam Anderson"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Initial English Level</label>
                <select
                  value={newStudentEnglishLevel}
                  onChange={(e) => setNewStudentEnglishLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
                >
                  <option value="None">🚫 None (Not Enrolled in English)</option>
                  {ENGLISH_LEVELS_DISPLAY_ORDER.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      Level {lvl}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Math (BTM)</label>
                  <select
                    value={newStudentBtmLevel}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewStudentBtmLevel(val);
                      if (val === 'Summit') setNewStudentCtmLevel('X');
                      if (val === 'None') setNewStudentCtmLevel('None');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="None">🚫 None</option>
                    {MATH_BTM_LEVELS_DISPLAY_ORDER.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl === 'Summit' ? '⭐ Summit' : `Level ${lvl}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Math (CTM)</label>
                  <select
                    value={newStudentBtmLevel === 'Summit' ? 'X' : (newStudentBtmLevel === 'None' ? 'None' : newStudentCtmLevel)}
                    disabled={newStudentBtmLevel === 'Summit' || newStudentBtmLevel === 'None'}
                    onChange={(e) => setNewStudentCtmLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 disabled:opacity-50 focus:bg-white focus:ring-2 focus:ring-sky-500"
                  >
                    {newStudentBtmLevel === 'None' ? (
                      <option value="None">🚫 None</option>
                    ) : newStudentBtmLevel === 'Summit' ? (
                      <option value="X">X (N/A)</option>
                    ) : (
                      <>
                        <option value="None">🚫 None</option>
                        {MATH_CTM_LEVELS_DISPLAY_ORDER.map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl === 'X' ? 'X (N/A)' : `Level ${lvl}`}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Needs extra focus on vocabulary"
                  value={newStudentNotes}
                  onChange={(e) => setNewStudentNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Student
              </button>
            </form>
          </div>

          {/* Student Roster Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Enrolled Students ({students.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">English</th>
                    <th className="py-3 px-4">Math (BTM / CTM)</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((s) => {
                    const isEditing = editingStudentId === s.id;
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {s.name}
                          {s.notes && <span className="block text-xs text-slate-400 font-normal">{s.notes}</span>}
                        </td>
                        <td className="py-3 px-4">
                          {isEditing ? (
                            <select
                              value={editEngLevel}
                              onChange={(e) => setEditEngLevel(e.target.value)}
                              className="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                            >
                              <option value="None">None</option>
                              {ENGLISH_LEVELS_DISPLAY_ORDER.map((l) => (
                                <option key={l} value={l}>
                                  Level {l}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs font-semibold px-2 py-0.5 bg-sky-50 text-sky-800 rounded border border-sky-100">
                              {s.default_english_level ? `Level ${s.default_english_level}` : 'None'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {isEditing ? (
                            <div className="flex gap-1">
                              <select
                                value={editBtmLevel}
                                onChange={(e) => {
                                  setEditBtmLevel(e.target.value);
                                  if (e.target.value === 'Summit') setEditCtmLevel('X');
                                  if (e.target.value === 'None') setEditCtmLevel('None');
                                }}
                                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                              >
                                <option value="None">None</option>
                                {MATH_BTM_LEVELS_DISPLAY_ORDER.map((l) => (
                                  <option key={l} value={l}>
                                    {l === 'Summit' ? 'Summit' : `BTM ${l}`}
                                  </option>
                                ))}
                              </select>
                              <select
                                value={editBtmLevel === 'Summit' ? 'X' : (editBtmLevel === 'None' ? 'None' : editCtmLevel)}
                                disabled={editBtmLevel === 'Summit' || editBtmLevel === 'None'}
                                onChange={(e) => setEditCtmLevel(e.target.value)}
                                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs disabled:opacity-50"
                              >
                                {editBtmLevel === 'None' ? (
                                  <option value="None">None</option>
                                ) : editBtmLevel === 'Summit' ? (
                                  <option value="X">X</option>
                                ) : (
                                  <>
                                    <option value="None">None</option>
                                    {MATH_CTM_LEVELS_DISPLAY_ORDER.map((l) => (
                                      <option key={l} value={l}>
                                        CTM {l}
                                      </option>
                                    ))}
                                  </>
                                )}
                              </select>
                            </div>
                          ) : (
                            <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-800 rounded border border-indigo-100">
                              {s.default_btm_level === 'Summit'
                                ? '⭐ Summit (X)'
                                : s.default_btm_level
                                ? `BTM ${s.default_btm_level} / CTM ${s.default_ctm_level || '—'}`
                                : 'None'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {isEditing ? (
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => handleSaveLevels(s.id)}
                                className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs font-semibold"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingStudentId(null)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartEditLevels(s)}
                              className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-800 font-semibold p-1"
                              title="Edit Default Levels"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Levels</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INSTRUCTORS & PASSWORDS */}
      {/* ========================================================================= */}
      {activeTab === 'instructors' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Instructor Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs h-fit space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-sky-600" />
              Add Instructor
            </h3>
            <form onSubmit={handleAddInstructor} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Instructor Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shaheen"
                  value={newInstructorName}
                  onChange={(e) => setNewInstructorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Registered Email (for Auth Login)</label>
                <input
                  type="email"
                  placeholder="e.g. shaheensyed2003@gmail.com"
                  value={newInstructorEmail}
                  onChange={(e) => setNewInstructorEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Instructor
              </button>
            </form>
          </div>

          {/* Instructor Directory & Password Actions */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Active Teaching Staff ({instructors.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Auth Login Email</th>
                    <th className="py-3 px-4 text-right">Password Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {instructors.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-semibold text-slate-900">{inst.name}</td>
                      <td className="py-3 px-4 text-slate-600 text-xs font-mono">{inst.email || 'No email set'}</td>
                      <td className="py-3 px-4 text-right">
                        {inst.email ? (
                          <button
                            onClick={() => {
                              setPasswordModalInstructor(inst);
                              setAdminNewPassword('');
                              setPasswordResetSuccess(null);
                              setPasswordResetError(null);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                            <span>Set Password</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">Set email first</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PARENT ACCESS (LINKS & PINS) */}
      {/* ========================================================================= */}
      {activeTab === 'parent_access' && (
        <div className="space-y-4">
          
          {/* Header & Search */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Share2 className="w-5 h-5 text-sky-600" />
                Parent Progress Report Links & PIN Management
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Each student has a unique, non-guessable URL. Share via WhatsApp or SMS along with their 4-digit PIN.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleGenerateAllAccess}
                disabled={saving}
                className="px-3 py-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Links for All (PIN: 1234)</span>
              </button>

              <div className="relative w-full sm:w-56">
                <input
                  type="text"
                  placeholder="Search student..."
                  value={parentSearch}
                  onChange={(e) => setParentSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Parent Links Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Parent Access Link</th>
                    <th className="py-3 px-4">Security PIN</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayParentList.map((pa) => {
                    const studentName = pa.student?.name || 'Student';
                    const hasToken = !!pa.access_token;
                    const isCopied = !!copiedTokenMap[pa.student_id];

                    return (
                      <tr key={pa.student_id} className="hover:bg-slate-50/60">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                          {studentName}
                        </td>

                        <td className="py-3.5 px-4">
                          {hasToken ? (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <code className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded max-w-[200px] truncate block">
                                /parent/{pa.access_token}
                              </code>

                              <button
                                onClick={() => handleCopyParentLink(pa.access_token, pa.student_id)}
                                className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
                                title="Copy Full URL"
                              >
                                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>

                              <button
                                onClick={() => handleShareWhatsApp(pa.access_token, studentName)}
                                className="p-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded text-emerald-700 transition-colors"
                                title="Share via WhatsApp"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>

                              <a
                                href={getFullParentUrl(pa.access_token)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded text-sky-600 transition-colors"
                                title="Preview Parent View"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Not generated yet</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenPinModal(pa.student_id, studentName)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                            <span>{pa.has_pin ? 'Change PIN' : 'Set PIN'}</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {hasToken ? (
                            <button
                              onClick={() => handleToggleAccess(pa.student_id, pa.active)}
                              className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${
                                pa.active
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                              }`}
                            >
                              {pa.active ? '● Active' : '○ Revoked'}
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {hasToken ? (
                            <button
                              onClick={() => handleRegenerateToken(pa.student_id, studentName)}
                              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-amber-700 font-semibold p-1"
                              title="Regenerate Link (Invalidates previous link)"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Regenerate</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleGenerateAccess(pa.student_id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Generate Link</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PARENT FEEDBACK INBOX */}
      {/* ========================================================================= */}
      {activeTab === 'parent_feedback' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-600" />
                Parent Feedback & Follow-up Inbox
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review ratings, comments, and callback requests submitted by parents from their progress reports.
              </p>
            </div>

            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              {(['all', 'new', 'reviewed', 'responded'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFeedbackStatusFilter(st)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition-colors ${
                    feedbackStatusFilter === st
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'new' && newFeedbackCount > 0 ? `New (${newFeedbackCount})` : st}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Items List */}
          {filteredFeedback.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">No feedback records found in this view.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFeedback.map((fb) => {
                const ratingBadge = fb.rating === 'good'
                  ? { emoji: '👍', text: 'Doing Great', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' }
                  : fb.rating === 'okay'
                  ? { emoji: '😐', text: 'Okay', bg: 'bg-amber-50 text-amber-800 border-amber-200' }
                  : fb.rating === 'needs_attention'
                  ? { emoji: '👎', text: 'Needs Attention', bg: 'bg-rose-50 text-rose-800 border-rose-200' }
                  : null;

                const isNew = fb.status === 'new';

                return (
                  <div
                    key={fb.id}
                    className={`bg-white rounded-xl border p-4 sm:p-5 shadow-xs transition-all ${
                      isNew ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {fb.student?.name || 'Student'}
                        </span>

                        {ratingBadge && (
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${ratingBadge.bg}`}>
                            <span>{ratingBadge.emoji}</span>
                            <span>{ratingBadge.text}</span>
                          </span>
                        )}

                        {fb.contact_requested && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-rose-500 text-white px-2.5 py-0.5 rounded-full shadow-xs animate-pulse">
                            <PhoneCall className="w-3 h-3" />
                            <span>Call Requested ({fb.contact_reason || 'General'})</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-xs text-slate-400">
                          {new Date(fb.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${
                          fb.status === 'new'
                            ? 'bg-amber-100 text-amber-900'
                            : fb.status === 'reviewed'
                            ? 'bg-sky-100 text-sky-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {fb.status}
                        </span>
                      </div>
                    </div>

                    {/* Feedback Content */}
                    <div className="py-3 text-xs sm:text-sm text-slate-800">
                      {fb.feedback_text ? (
                        <p className="whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-100 font-medium">
                          "{fb.feedback_text}"
                        </p>
                      ) : (
                        <p className="text-slate-400 italic">No additional written comment supplied.</p>
                      )}
                    </div>

                    {/* Status Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">Update Status:</span>
                        <button
                          onClick={() => handleUpdateFeedbackStatus(fb.id, 'reviewed')}
                          disabled={fb.status === 'reviewed'}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold disabled:opacity-50"
                        >
                          Mark Reviewed
                        </button>
                        <button
                          onClick={() => handleUpdateFeedbackStatus(fb.id, 'responded')}
                          disabled={fb.status === 'responded'}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-xs font-semibold disabled:opacity-50"
                        >
                          Mark Responded
                        </button>
                      </div>

                      {fb.reviewed_at && (
                        <span className="text-[11px] text-slate-400">
                          Reviewed on {new Date(fb.reviewed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: CURRICULUM & LEVELS */}
      {/* ========================================================================= */}
      {activeTab === 'curriculum' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* English Curriculum */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sky-600" />
              English Curriculum Order
            </h3>
            <p className="text-xs text-slate-500">
              Listed from Highest level down to Entry level.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {ENGLISH_LEVELS_DISPLAY_ORDER.map((l, i) => (
                <span
                  key={l}
                  className="px-3 py-1.5 bg-sky-50 text-sky-900 border border-sky-200 rounded-lg text-xs font-semibold"
                >
                  {i + 1}. Level {l}
                </span>
              ))}
            </div>
          </div>

          {/* Math Curriculum */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              Mathematics Curriculum Tracks
            </h3>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-indigo-600" />
                Basic Thinking Math (BTM)
              </h4>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold">
                  ⭐ Summit (Special Product)
                </span>
                {MATH_BTM_LEVELS_DISPLAY_ORDER.filter(l => l !== 'Summit').slice(0, 10).map((l) => (
                  <span key={l} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-mono font-medium">
                    {l}
                  </span>
                ))}
                <span className="text-xs text-slate-400 self-center">... down to 1</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                Critical Thinking Math (CTM)
              </h4>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-lg text-xs font-bold">
                  X (for Summit / NA)
                </span>
                {MATH_CTM_LEVELS_DISPLAY_ORDER.filter(l => l !== 'X').slice(0, 10).map((l) => (
                  <span key={l} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-mono font-medium">
                    {l}
                  </span>
                ))}
                <span className="text-xs text-slate-400 self-center">... down to 1</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: SET / CHANGE PARENT PIN MODAL */}
      {/* ========================================================================= */}
      {pinModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Lock className="w-5 h-5 text-sky-600" />
                <span>Security PIN for {pinModalData.studentName}</span>
              </div>
              <button
                onClick={() => setPinModalData(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Set or update the security PIN required by the parent to open the report link.
            </p>

            {parentPinSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{parentPinSuccess}</span>
              </div>
            )}

            {parentPinError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{parentPinError}</span>
              </div>
            )}

            <form onSubmit={handleSaveParentPin} className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">4-Digit Security PIN</label>
                  <button
                    type="button"
                    onClick={() => {
                      const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
                      setParentPinInput(randomPin);
                    }}
                    className="text-xs text-sky-600 hover:text-sky-700 font-semibold inline-flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Auto-Generate
                  </button>
                </div>

                <input
                  type="text"
                  maxLength={6}
                  required
                  value={parentPinInput}
                  onChange={(e) => setParentPinInput(e.target.value)}
                  className="w-full text-center text-xl font-bold font-mono tracking-widest px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPinModalData(null)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={parentPinLoading || !parentPinInput}
                  className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {parentPinLoading ? 'Saving...' : 'Save PIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADMIN RESET INSTRUCTOR PASSWORD MODAL */}
      {/* ========================================================================= */}
      {passwordModalInstructor && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <KeyRound className="w-5 h-5 text-sky-600" />
                <span>Reset Password for {passwordModalInstructor.name}</span>
              </div>
              <button
                onClick={() => setPasswordModalInstructor(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Set or generate a new login password for <strong className="text-slate-800">{passwordModalInstructor.email}</strong>.
            </p>

            {passwordResetSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordResetSuccess}</span>
              </div>
            )}

            {passwordResetError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordResetError}</span>
              </div>
            )}

            <form onSubmit={handleAdminResetPassword} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    New Password (min 6 characters)
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
                  className="flex-1 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
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
