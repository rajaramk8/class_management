import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { ClassUpdate, Homework, Student, Instructor, Subject } from '../types';
import { formatLevelDisplay } from '../constants/levels';
import { 
  BarChart3, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Printer 
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export const Reports: React.FC = () => {
  const [classUpdates, setClassUpdates] = useState<ClassUpdate[]>([]);
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Report Date Range Preset
  const [reportRangeType, setReportRangeType] = useState<'mtd' | 'full_month' | 'custom'>('mtd');
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [startDate, setStartDate] = useState<string>(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  // Filters
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [studs, insts, subs] = await Promise.all([
          api.getStudents(),
          api.getInstructors(),
          api.getSubjects(),
        ]);
        setStudents(studs);
        setInstructors(insts);
        setSubjects(subs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (reportRangeType === 'mtd') {
      setStartDate(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
      setEndDate(format(new Date(), 'yyyy-MM-dd'));
    } else if (reportRangeType === 'full_month') {
      const [year, month] = selectedMonth.split('-').map(Number);
      const monthDate = new Date(year, month - 1, 1);
      setStartDate(format(startOfMonth(monthDate), 'yyyy-MM-dd'));
      setEndDate(format(endOfMonth(monthDate), 'yyyy-MM-dd'));
    }
  }, [reportRangeType, selectedMonth]);

  useEffect(() => {
    async function fetchReportData() {
      try {
        setLoading(true);
        const [classes, hw] = await Promise.all([
          api.getClassUpdates({
            studentId: selectedStudentId || undefined,
            instructorId: selectedInstructorId || undefined,
            subjectId: selectedSubjectId || undefined,
            startDate: startDate,
            endDate: endDate,
          }),
          api.getHomeworkList(selectedStudentId || undefined),
        ]);
        setClassUpdates(classes);
        setHomeworkList(hw);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (startDate && endDate) {
      fetchReportData();
    }
  }, [startDate, endDate, selectedStudentId, selectedInstructorId, selectedSubjectId]);

  // Aggregate Metrics
  const totalClasses = classUpdates.length;
  const totalDurationMinutes = classUpdates.reduce((acc, curr) => acc + curr.duration_minutes, 0);
  const totalDurationHours = (totalDurationMinutes / 60).toFixed(1);

  const pendingHwCount = homeworkList.filter(h => !h.checked).length;
  const checkedHwCount = homeworkList.filter(h => h.checked).length;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8">
      {/* Page Title & Print Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600" />
            Class & Homework Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Detailed performance metrics, student levels, and homework summaries.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="no-print inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>Print Report</span>
        </button>
      </div>

      {/* Filter Control Box */}
      <div className="no-print bg-white rounded-xl border border-slate-200 p-3.5 sm:p-5 mb-4 sm:mb-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3 mb-2">
          
          {/* Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
              Report Range
            </label>
            <select
              value={reportRangeType}
              onChange={(e: any) => setReportRangeType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
            >
              <option value="mtd">Month-to-Date (MTD)</option>
              <option value="full_month">Full Month</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Range Options */}
          {reportRangeType === 'full_month' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                Select Month
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                  From Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  disabled={reportRangeType === 'mtd'}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 disabled:opacity-60 focus:bg-white focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                  To Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  disabled={reportRangeType === 'mtd'}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 disabled:opacity-60 focus:bg-white focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </>
          )}

          {/* Student Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
              Student Filter
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
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
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
              Instructor Filter
            </label>
            <select
              value={selectedInstructorId}
              onChange={(e) => setSelectedInstructorId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
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
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
              Subject Filter
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Executive Summary Stat Cards (2x2 on Mobile, 4x1 on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Classes</span>
            <span className="p-1.5 sm:p-2 bg-sky-50 text-sky-600 rounded-lg">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <p className="text-xl sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">{totalClasses}</p>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 truncate">Total in range</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</span>
            <span className="p-1.5 sm:p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <p className="text-xl sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">{totalDurationHours} <span className="text-xs sm:text-lg font-medium text-slate-500">hrs</span></p>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 truncate">{totalDurationMinutes} mins total</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Checked HW</span>
            <span className="p-1.5 sm:p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <p className="text-xl sm:text-3xl font-bold text-emerald-600 mt-1 sm:mt-2">{checkedHwCount}</p>
          <p className="text-[10px] sm:text-xs text-emerald-700/80 mt-0.5 truncate">Completed</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending HW</span>
            <span className="p-1.5 sm:p-2 bg-amber-50 text-amber-600 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <p className="text-xl sm:text-3xl font-bold text-amber-600 mt-1 sm:mt-2">{pendingHwCount}</p>
          <p className="text-[10px] sm:text-xs text-amber-700/80 mt-0.5 truncate">Awaiting check</p>
        </div>
      </div>

      {/* Detailed Student Report Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-base">Class Breakdown & Summary</h3>
          <span className="text-xs text-slate-500">{classUpdates.length} records in range</span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-2"></div>
            <p className="text-sm text-slate-500">Loading report data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Instructor</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Level(s)</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Booklet</th>
                  <th className="py-3 px-4">CW</th>
                  <th className="py-3 px-4">HW</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classUpdates.map((c) => {
                  const levelDisplay = formatLevelDisplay({
                    subjectName: c.subject?.name,
                    englishLevel: c.english_level,
                    btmLevel: c.btm_level,
                    ctmLevel: c.ctm_level,
                    levelName: c.level?.name,
                  });

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">{c.class_date}</td>
                      <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">{c.student?.name}</td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{c.instructor?.name}</td>
                      <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">{c.subject?.name}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center text-xs font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                          {levelDisplay}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">{c.duration_minutes}m</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-700 whitespace-nowrap">{c.booklet_number || '—'}</td>
                      <td className="py-3 px-4 text-slate-800 max-w-xs truncate">{c.cw || '—'}</td>
                      <td className="py-3 px-4 text-sky-900 font-medium max-w-xs truncate">{c.hw || '—'}</td>
                    </tr>
                  );
                })}
                {classUpdates.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No classes recorded in the selected date range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
