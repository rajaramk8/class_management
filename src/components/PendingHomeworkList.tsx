import React, { useState } from 'react';
import { Homework, Student, Subject, HomeworkStatusValue } from '../types';
import { 
  AlertCircle, 
  Calendar, 
  BookOpen, 
  Bookmark, 
  CheckCircle2, 
  UserCheck,
  FileText,
  PlusCircle,
  History,
  ChevronDown,
  ChevronUp,
  Clock
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { HomeworkStatusModal, HOMEWORK_STATUS_CONFIG } from './HomeworkStatusModal';

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
  onAddStatus?: (homeworkId: string, status: HomeworkStatusValue | string, note?: string) => Promise<void>;
  currentInstructorName?: string;
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
  onAddStatus,
  currentInstructorName
}) => {
  const [selectedHwForStatus, setSelectedHwForStatus] = useState<Homework | null>(null);
  const [expandedHistoryIds, setExpandedHistoryIds] = useState<string[]>([]);

  const toggleHistoryExpand = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedHistoryIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleOpenStatusModal = (hw: Homework, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedHwForStatus(hw);
  };

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
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 sm:p-5 text-emerald-900 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
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
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors shrink-0 self-end sm:self-auto"
          >
            {filterAllSubjects ? 'Filter: All Subjects' : `Filter: ${subject?.name || 'Current'} Only`}
          </button>
        </div>
      </div>
    );
  }

  const allSelected = pendingHomework.length > 0 && selectedIds.length === pendingHomework.length;

  return (
    <>
      <div className="bg-gradient-to-br from-amber-50/90 to-orange-50/60 border-2 border-amber-300/90 rounded-2xl p-3.5 sm:p-5 shadow-xs">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200 mb-3">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="p-1.5 sm:p-2 bg-amber-500 text-white rounded-xl shadow-xs shrink-0 mt-0.5 sm:mt-0">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-amber-950">
                  Previous Pending Homework
                </h3>
                <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2 py-0.2 rounded-full">
                  {pendingHomework.length} Unchecked
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                Review progress, record timeline updates, and check off homework for <span className="font-semibold">{student.name}</span>:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              type="button"
              onClick={onToggleSubjectFilter}
              className="text-[11px] sm:text-xs font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1.5 rounded-lg transition-colors border border-amber-300"
              title="Toggle between current subject and all subjects"
            >
              {filterAllSubjects ? 'All Subjects' : (subject?.name || 'Subject')}
            </button>

            <button
              type="button"
              onClick={onToggleAll}
              className="text-[11px] sm:text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg shadow-xs transition-colors"
            >
              {allSelected ? 'Uncheck All' : 'Select All'}
            </button>
          </div>
        </div>

        {/* List of Previous Unchecked Homework Cards */}
        <div className="space-y-3">
          {pendingHomework.map((hw) => {
            const isChecked = selectedIds.includes(hw.id);
            const isHistoryExpanded = expandedHistoryIds.includes(hw.id);
            const history = hw.status_history || [];
            const latestStatus = hw.latest_status || (history.length > 0 ? history[0] : null);

            let formattedAssignedDate = hw.assigned_date;
            try {
              formattedAssignedDate = format(parseISO(hw.assigned_date), 'dd MMM yyyy');
            } catch {}

            let statusDateFormatted = '';
            if (latestStatus?.created_at) {
              try {
                statusDateFormatted = format(parseISO(latestStatus.created_at), 'dd MMM');
              } catch {}
            }

            const statusConfig = latestStatus?.status
              ? HOMEWORK_STATUS_CONFIG[latestStatus.status as HomeworkStatusValue] || {
                  badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
                  label: latestStatus.status
                }
              : null;

            return (
              <div
                key={hw.id}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                  isChecked
                    ? 'bg-emerald-50/90 border-emerald-300 text-slate-900 shadow-xs ring-2 ring-emerald-400/80'
                    : 'bg-white border-amber-200 hover:border-amber-400 text-slate-800 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* HW Checked Checkbox */}
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggle(hw.id)}
                    className="mt-1 w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer shrink-0"
                    title="Mark HW as Checked by instructor"
                  />

                  <div className="flex-1 space-y-2 min-w-0">
                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        Assigned: {formattedAssignedDate}
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

                      {/* Current Status Badge */}
                      {statusConfig ? (
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border shadow-2xs ${statusConfig.badgeClass}`}>
                          <span>Current: {statusConfig.label}</span>
                          {statusDateFormatted && <span className="text-[10px] opacity-75">({statusDateFormatted})</span>}
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          No status yet
                        </span>
                      )}

                      {isChecked && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full ml-auto">
                          ✓ Checked
                        </span>
                      )}
                    </div>

                    {/* Previous Classwork context if available */}
                    {hw.class_update?.cw && (
                      <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="font-semibold text-slate-700">Previous CW:</span> {hw.class_update.cw}
                      </div>
                    )}

                    {/* Homework Assignment Text */}
                    <div>
                      <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-amber-600" />
                        Homework Assignment:
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 bg-amber-50/60 p-2.5 rounded-lg border border-amber-100 whitespace-pre-wrap">
                        {hw.homework_text}
                      </p>
                    </div>

                    {/* Latest Note preview if present */}
                    {latestStatus?.note && !isHistoryExpanded && (
                      <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <span className="font-semibold text-slate-700">Latest Note:</span> "{latestStatus.note}"
                      </div>
                    )}

                    {/* Action Row: + Add status/note & View history */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-100">
                      <div className="flex items-center gap-2">
                        {onAddStatus && (
                          <button
                            type="button"
                            onClick={(e) => handleOpenStatusModal(hw, e)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>+ Add HW status/note</span>
                          </button>
                        )}

                        {history.length > 0 && (
                          <button
                            type="button"
                            onClick={(e) => toggleHistoryExpand(hw.id, e)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <History className="w-3.5 h-3.5 text-slate-500" />
                            <span>History ({history.length})</span>
                            {isHistoryExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500">
                        {isChecked ? (
                          <span className="text-emerald-700 font-semibold">✓ Marked as Reviewed</span>
                        ) : (
                          <span>Checkbox = HW Checked</span>
                        )}
                      </div>
                    </div>

                    {/* Expandable Status History Timeline */}
                    {isHistoryExpanded && history.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200 space-y-2 animate-fadeIn">
                        <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                          <History className="w-3 h-3 text-sky-600" />
                          <span>Status Timeline (Newest First)</span>
                        </div>

                        <div className="space-y-1.5">
                          {history.map((entry, idx) => {
                            let dtStr = entry.created_at;
                            try {
                              dtStr = format(parseISO(entry.created_at), 'dd MMM yyyy, HH:mm');
                            } catch {}

                            const entryConf = HOMEWORK_STATUS_CONFIG[entry.status as HomeworkStatusValue] || {
                              badgeClass: 'bg-slate-100 text-slate-800 border-slate-300'
                            };

                            return (
                              <div key={entry.id || idx} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-0.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`px-2 py-0.2 rounded-full font-bold text-[10px] border ${entryConf.badgeClass}`}>
                                    {entry.status}
                                  </span>
                                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {dtStr} • {entry.instructor_name || 'Instructor'}
                                  </span>
                                </div>
                                {entry.note && (
                                  <p className="text-slate-700 text-[11px] font-medium pt-0.5">
                                    "{entry.note}"
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reusable Status / Note Modal */}
      {selectedHwForStatus && onAddStatus && (
        <HomeworkStatusModal
          isOpen={Boolean(selectedHwForStatus)}
          homework={selectedHwForStatus}
          onClose={() => setSelectedHwForStatus(null)}
          onSaveStatus={onAddStatus}
          currentInstructorName={currentInstructorName}
        />
      )}
    </>
  );
};
