import React from 'react';
import { Homework, Student, Subject } from '../types';
import { 
  AlertCircle, 
  Calendar, 
  BookOpen, 
  Bookmark, 
  CheckCircle2, 
  UserCheck,
  FileText
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface PendingHomeworkListProps {
  student?: Student;
  subject?: Subject;
  pendingHomework: Homework[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  loading: boolean;
  filterAllSubjects: boolean;
  onToggleSubjectFilter: () => void;
}

export const PendingHomeworkList: React.FC<PendingHomeworkListProps> = ({
  student,
  subject,
  pendingHomework,
  selectedIds,
  onToggle,
  onToggleAll,
  loading,
  filterAllSubjects,
  onToggleSubjectFilter,
}) => {
  // 1. State when no student has been selected yet
  if (!student) {
    return (
      <div className="bg-slate-50 border-2 border-dashed border-slate-300/80 rounded-2xl p-6 text-center">
        <div className="w-10 h-10 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-2.5">
          <UserCheck className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">Previous Unchecked Homework</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Select a student from the dropdown above to automatically load and review any pending homework assignments for {subject?.name || 'this subject'}.
        </p>
      </div>
    );
  }

  // 2. Loading state
  if (loading) {
    return (
      <div className="bg-amber-50/40 border border-amber-200/80 rounded-2xl p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-amber-600 border-t-transparent mb-2"></div>
        <p className="text-xs font-semibold text-amber-900">Loading previous homework for {student.name}...</p>
      </div>
    );
  }

  // 3. Clean state: No pending homework
  if (pendingHomework.length === 0) {
    return (
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 text-emerald-900 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950">
                No Unchecked Homework
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                All previous homework for <span className="font-semibold">{student.name}</span> in {subject?.name || 'this subject'} has been completed and checked.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleSubjectFilter}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            {filterAllSubjects ? 'Filter: All Subjects' : `Filter: ${subject?.name || 'Current'} Only`}
          </button>
        </div>
      </div>
    );
  }

  const allSelected = pendingHomework.length > 0 && selectedIds.length === pendingHomework.length;

  return (
    <div className="bg-gradient-to-br from-amber-50/90 to-orange-50/60 border-2 border-amber-300/90 rounded-2xl p-5 shadow-sm">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-amber-200 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-amber-950">
                Previous Pending Homework
              </h3>
              <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                {pendingHomework.length} Unchecked
              </span>
            </div>
            <p className="text-xs text-amber-800 mt-0.5">
              Review and check off completed previous homework for <span className="font-semibold">{student.name}</span> ({subject?.name}):
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={onToggleSubjectFilter}
            className="text-xs font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1.5 rounded-lg transition-colors border border-amber-300"
            title="Toggle between current subject and all subjects"
          >
            {filterAllSubjects ? 'Showing: All Subjects' : `Showing: ${subject?.name || 'Subject'}`}
          </button>

          <button
            type="button"
            onClick={onToggleAll}
            className="text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg shadow-xs transition-colors"
          >
            {allSelected ? 'Uncheck All' : 'Select All'}
          </button>
        </div>
      </div>

      {/* List of Previous Unchecked Homework Cards */}
      <div className="space-y-3">
        {pendingHomework.map((hw) => {
          const isChecked = selectedIds.includes(hw.id);
          let formattedDate = hw.assigned_date;
          try {
            formattedDate = format(parseISO(hw.assigned_date), 'dd-MMM-yyyy');
          } catch {}

          return (
            <label
              key={hw.id}
              className={`block p-4 rounded-xl border transition-all cursor-pointer select-none ${
                isChecked
                  ? 'bg-emerald-50 border-emerald-300 text-slate-900 shadow-sm ring-2 ring-emerald-400'
                  : 'bg-white border-amber-200 hover:border-amber-400 text-slate-800 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggle(hw.id)}
                  className="mt-1 w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer shrink-0"
                />

                <div className="flex-1 space-y-1.5">
                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      Assigned: {formattedDate}
                    </span>

                    {hw.subject && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        <BookOpen className="w-3 h-3" />
                        {hw.subject.name}
                      </span>
                    )}

                    {hw.class_update?.booklet_number && (
                      <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-slate-700 bg-amber-100/70 px-2 py-0.5 rounded">
                        <Bookmark className="w-3 h-3 text-amber-700" />
                        Booklet {hw.class_update.booklet_number}
                      </span>
                    )}

                    {isChecked ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full ml-auto">
                        ✓ Marked as Checked
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-amber-700 ml-auto">
                        Click to mark checked
                      </span>
                    )}
                  </div>

                  {/* Previous Classwork context if available */}
                  {hw.class_update?.cw && (
                    <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-700">Previous CW:</span> {hw.class_update.cw}
                    </div>
                  )}

                  {/* Unchecked Homework text */}
                  <div className="pt-0.5">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                      Homework To Review:
                    </div>
                    <p className="text-sm font-semibold text-slate-900 bg-amber-50/70 p-2.5 rounded-lg border border-amber-100 whitespace-pre-wrap">
                      {hw.homework_text}
                    </p>
                  </div>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};
