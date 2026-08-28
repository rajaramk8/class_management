import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { ClassUpdate, Student, Instructor, Subject } from '../types';
import { EditClassModal } from '../components/EditClassModal';
import { format, parseISO } from 'date-fns';
import { 
  Search, 
  Download, 
  History, 
  Bookmark, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  X,
  FileText,
  Edit3,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { formatLevelDisplay } from '../constants/levels';

export const ClassHistory: React.FC = () => {
  const { user, currentInstructor } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [updates, setUpdates] = useState<ClassUpdate[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingClass, setEditingClass] = useState<ClassUpdate | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);


  // Filters
  const [studentFilter, setStudentFilter] = useState('');
  const [instructorFilter, setInstructorFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Expanded card tracking on mobile
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ups, studs, insts, subs] = await Promise.all([
        api.getClassUpdates(),
        api.getStudents(),
        api.getInstructors(),
        api.getSubjects(),
      ]);
      setUpdates(ups);
      setStudents(studs);
      setInstructors(insts);
      setSubjects(subs);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditClass = (u: ClassUpdate) => {
    setEditingClass(u);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    loadData();
    setSuccessBanner('Class record updated successfully!');
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleDeleteClass = async (u: ClassUpdate) => {
    const studentName = u.student?.name || 'this student';
    const confirmMsg = `Are you sure you want to permanently delete the class record on ${u.class_date} for ${studentName}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setDeletingId(u.id);
      await api.deleteClassUpdate(u.id);
      await loadData();
      setSuccessBanner('Class record deleted successfully.');
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to delete class record.');
    } finally {
      setDeletingId(null);
    }
  };


  const activeFilterCount = [
    studentFilter,
    instructorFilter,
    subjectFilter,
    startDate,
    endDate,
    searchQuery
  ].filter(Boolean).length;

  const resetFilters = () => {
    setStudentFilter('');
    setInstructorFilter('');
    setSubjectFilter('');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  const filteredUpdates = updates.filter((u) => {
    if (studentFilter && u.student_id !== studentFilter) return false;
    if (instructorFilter && u.instructor_id !== instructorFilter) return false;
    if (subjectFilter && u.subject_id !== subjectFilter) return false;
    if (startDate && u.class_date < startDate) return false;
    if (endDate && u.class_date > endDate) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const sName = u.student?.name.toLowerCase() || '';
      const iName = u.instructor?.name.toLowerCase() || '';
      const cw = u.cw?.toLowerCase() || '';
      const hw = u.hw?.toLowerCase() || '';
      const btm = u.btm_level?.toLowerCase() || '';
      const ctm = u.ctm_level?.toLowerCase() || '';
      const eng = u.english_level?.toLowerCase() || '';
      const bNum = u.booklet_number?.toLowerCase() || '';

      const match =
        sName.includes(q) ||
        iName.includes(q) ||
        cw.includes(q) ||
        hw.includes(q) ||
        btm.includes(q) ||
        ctm.includes(q) ||
        eng.includes(q) ||
        bNum.includes(q);

      if (!match) return false;
    }

    return true;
  });

  const exportCSV = () => {
    const headers = ['Date', 'Student', 'Instructor', 'Subject', 'Level(s)', 'Duration (mins)', 'Booklet', 'Classwork (CW)', 'Homework (HW)'];
    const rows = filteredUpdates.map(u => {
      const levelText = formatLevelDisplay({
        subjectName: u.subject?.name,
        englishLevel: u.english_level,
        btmLevel: u.btm_level,
        ctmLevel: u.ctm_level,
        levelName: u.level?.name,
      });

      return [
        u.class_date,
        `"${u.student?.name || ''}"`,
        `"${u.instructor?.name || ''}"`,
        `"${u.subject?.name || ''}"`,
        `"${levelText}"`,
        u.duration_minutes,
        `"${u.booklet_number || ''}"`,
        `"${(u.cw || '').replace(/"/g, '""')}"`,
        `"${(u.hw || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `class_updates_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600" />
            Class Records History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Browse and filter historical class records, English levels, and Math BTM/CTM levels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="sm:hidden inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Filter className="w-3.5 h-3.5 text-sky-600" />
            <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
          </button>

          <button
            onClick={exportCSV}
            disabled={filteredUpdates.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs sm:text-sm font-medium rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successBanner && (
        <div className="mb-4 sm:mb-6 p-3.5 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-emerald-800 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-600 hover:text-emerald-800 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}


      {/* Filter Bar Card (Always visible on sm+, collapsible on mobile) */}
      <div className={`bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 mb-4 sm:mb-6 shadow-xs ${showMobileFilters ? 'block' : 'hidden sm:block'}`}>
        <div className="flex items-center justify-between sm:hidden pb-2 mb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-800">Filter Records</span>
          <button onClick={() => setShowMobileFilters(false)} className="text-slate-400 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 sm:gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student, CW, HW..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Student Filter */}
          <div>
            <select
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option value="">All Students</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Instructor Filter */}
          <div>
            <select
              value={instructorFilter}
              onChange={(e) => setInstructorFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option value="">All Instructors</option>
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option value="">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              disabled={activeFilterCount === 0}
              className="w-full px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg transition-colors"
            >
              Reset Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
            </button>
          </div>
        </div>
      </div>

      {/* Class Records Display */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-2"></div>
          <p className="text-sm text-slate-500">Loading class history...</p>
        </div>
      ) : filteredUpdates.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 shadow-xs">
          <History className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-semibold text-slate-700">No records found</h3>
          <p className="text-sm mt-1">Try adjusting the filter criteria or record a new class.</p>
        </div>
      ) : (
        <>
          {/* 1. Mobile Cards View (Visible on screens < sm) */}
          <div className="sm:hidden space-y-3">
            <div className="text-xs font-bold text-slate-500 px-1">
              Showing {filteredUpdates.length} records
            </div>

            {filteredUpdates.map((u) => {
              let formattedDate = u.class_date;
              try {
                formattedDate = format(parseISO(u.class_date), 'dd MMM yyyy');
              } catch {}

              const isExpanded = expandedCardId === u.id;
              const levelDisplay = formatLevelDisplay({
                subjectName: u.subject?.name,
                englishLevel: u.english_level,
                btmLevel: u.btm_level,
                ctmLevel: u.ctm_level,
                levelName: u.level?.name,
              });

              return (
                <div 
                  key={`card-${u.id}`} 
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 transition-shadow"
                >
                  {/* Top Row: Date, Student Name, Subject badge & Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        {formattedDate}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base">
                        {u.student?.name || 'Unknown Student'}
                      </h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Instructor: <span className="font-medium text-slate-700">{u.instructor?.name || '—'}</span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-1">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          u.subject?.name.toLowerCase() === 'math'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {u.subject?.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {u.duration_minutes >= 60 ? `${u.duration_minutes / 60} hr` : `${u.duration_minutes}m`}
                        </span>
                      </div>

                      {/* Action buttons (Mobile) */}
                      <div className="flex items-center gap-1">
                        {(isAdmin || (currentInstructor && u.instructor_id === currentInstructor.id)) && (
                          <button
                            onClick={() => handleEditClass(u)}
                            className="p-1 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors"
                            title="Edit Class Record"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteClass(u)}
                            disabled={deletingId === u.id}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-50"
                            title="Delete Class Record"
                          >
                            {deletingId === u.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-2 border-rose-600 border-t-transparent" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Level & Booklet Pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                    <span className="inline-flex items-center text-xs font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {levelDisplay}
                    </span>
                    {u.booklet_number && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        <Bookmark className="w-3 h-3 text-slate-400" />
                        {u.booklet_number}
                      </span>
                    )}
                  </div>

                  {/* Expand/Collapse Classwork & Homework */}
                  <div className="pt-1">
                    <button
                      onClick={() => setExpandedCardId(isExpanded ? null : u.id)}
                      className="w-full flex items-center justify-between text-xs font-semibold text-sky-600 hover:text-sky-700 py-1"
                    >
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {isExpanded ? 'Hide Details' : 'View Classwork & Homework'}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 p-3 bg-slate-50 rounded-lg space-y-2 text-xs border border-slate-200 animate-in fade-in duration-150">
                        <div>
                          <span className="font-bold text-slate-700 block mb-0.5">Classwork (CW):</span>
                          <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                            {u.cw || <span className="italic text-slate-400">None recorded</span>}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-slate-200">
                          <span className="font-bold text-slate-700 block mb-0.5">Assigned Homework (HW):</span>
                          <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                            {u.hw || <span className="italic text-slate-400">None assigned</span>}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. Desktop Table View (Visible on screens >= sm) */}
          <div className="hidden sm:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Instructor</th>
                    <th className="py-3.5 px-4">Subject</th>
                    <th className="py-3.5 px-4">Level(s)</th>
                    <th className="py-3.5 px-4">Duration</th>
                    <th className="py-3.5 px-4">Booklet</th>
                    <th className="py-3.5 px-4">Classwork (CW)</th>
                    <th className="py-3.5 px-4">Homework (HW)</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUpdates.map((u) => {
                    let formattedDate = u.class_date;
                    try {
                      formattedDate = format(parseISO(u.class_date), 'dd-MMM-yyyy');
                    } catch {}

                    const levelDisplay = formatLevelDisplay({
                      subjectName: u.subject?.name,
                      englishLevel: u.english_level,
                      btmLevel: u.btm_level,
                      ctmLevel: u.ctm_level,
                      levelName: u.level?.name,
                    });

                    const canEdit = isAdmin || (currentInstructor && u.instructor_id === currentInstructor.id);
                    const canDelete = isAdmin;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                          {formattedDate}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-900 whitespace-nowrap">
                          {u.student?.name || 'Unknown'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          {u.instructor?.name || '—'}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-800">
                            {u.subject?.name}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                            {levelDisplay}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                          {u.duration_minutes >= 60 
                            ? `${u.duration_minutes / 60} hr${u.duration_minutes > 60 ? 's' : ''}` 
                            : `${u.duration_minutes} mins`}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          {u.booklet_number || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate" title={u.cw || undefined}>
                          {u.cw || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate" title={u.hw || undefined}>
                          {u.hw || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {canEdit && (
                              <button
                                onClick={() => handleEditClass(u)}
                                className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                title="Edit Class Record"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteClass(u)}
                                disabled={deletingId === u.id}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete Class Record"
                              >
                                {deletingId === u.id ? (
                                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-rose-600 border-t-transparent" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Edit Class Record Modal */}
      <EditClassModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingClass(null);
        }}
        onSuccess={handleEditSuccess}
        classUpdate={editingClass}
        students={students}
        instructors={instructors}
        subjects={subjects}
        isAdmin={isAdmin}
      />
    </div>
  );
};

