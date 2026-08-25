import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { ClassUpdate, Student, Instructor, Subject } from '../types';
import { formatLevelDisplay } from '../constants/levels';
import { format, parseISO } from 'date-fns';
import { 
  History, 
  Search, 
  Download
} from 'lucide-react';

export const ClassHistory: React.FC = () => {
  const [classUpdates, setClassUpdates] = useState<ClassUpdate[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Filters
  const [studentFilter, setStudentFilter] = useState<string>('');
  const [instructorFilter, setInstructorFilter] = useState<string>('');
  const [subjectFilter, setSubjectFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await api.getClassUpdates({
        studentId: studentFilter || undefined,
        instructorId: instructorFilter || undefined,
        subjectId: subjectFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setClassUpdates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [studentFilter, instructorFilter, subjectFilter, startDate, endDate]);

  const filteredUpdates = classUpdates.filter((cu) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const studentName = cu.student?.name.toLowerCase() || '';
    const cw = cu.cw?.toLowerCase() || '';
    const hw = cu.hw?.toLowerCase() || '';
    const booklet = cu.booklet_number?.toLowerCase() || '';
    const btm = cu.btm_level || '';
    const ctm = cu.ctm_level || '';
    const eng = cu.english_level || '';
    return (
      studentName.includes(q) || 
      cw.includes(q) || 
      hw.includes(q) || 
      booklet.includes(q) ||
      btm.includes(q) ||
      ctm.includes(q) ||
      eng.toLowerCase().includes(q)
    );
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-sky-600" />
            Class Records History
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Browse and filter historical class records, English levels, and Math BTM/CTM levels.
          </p>
        </div>

        <button
          onClick={exportCSV}
          disabled={filteredUpdates.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export CSV
        </button>
      </div>

      {/* Filter Bar Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search student, CW, HW, level..."
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
              onClick={() => {
                setStudentFilter('');
                setInstructorFilter('');
                setSubjectFilter('');
                setStartDate('');
                setEndDate('');
                setSearchQuery('');
              }}
              className="w-full px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Class Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-2"></div>
            <p className="text-sm text-slate-500">Loading class history...</p>
          </div>
        ) : filteredUpdates.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <History className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-semibold text-slate-700">No records found</h3>
            <p className="text-sm mt-1">Try adjusting the filter criteria or record a new class.</p>
          </div>
        ) : (
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
                      <td className="py-3.5 px-4 text-slate-700 font-mono text-xs whitespace-nowrap">
                        {u.booklet_number || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 max-w-xs truncate" title={u.cw || ''}>
                        {u.cw || <span className="text-slate-400">—</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 max-w-xs truncate font-medium text-sky-900" title={u.hw || ''}>
                        {u.hw || <span className="text-slate-400">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
