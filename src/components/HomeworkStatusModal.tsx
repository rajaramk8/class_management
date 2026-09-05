import React, { useState } from 'react';
import { Homework, HomeworkStatusValue } from '../types';
import { 
  X, 
  Clock, 
  User, 
  Check, 
  PlusCircle, 
  FileText, 
  Calendar,
  AlertCircle,
  History
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface HomeworkStatusModalProps {
  isOpen: boolean;
  homework: Homework | null;
  onClose: () => void;
  onSaveStatus: (homeworkId: string, status: HomeworkStatusValue | string, note?: string) => Promise<void>;
  currentInstructorName?: string;
}

export const HOMEWORK_STATUS_CONFIG: Record<HomeworkStatusValue, { label: string; badgeClass: string; borderClass: string; bgClass: string }> = {
  'Not done': {
    label: 'Not done',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    borderClass: 'border-rose-400',
    bgClass: 'hover:bg-rose-50'
  },
  'Partially completed': {
    label: 'Partially completed',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    borderClass: 'border-amber-400',
    bgClass: 'hover:bg-amber-50'
  },
  'Completed': {
    label: 'Completed',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    borderClass: 'border-emerald-400',
    bgClass: 'hover:bg-emerald-50'
  },
  'Needs correction': {
    label: 'Needs correction',
    badgeClass: 'bg-orange-100 text-orange-900 border-orange-300',
    borderClass: 'border-orange-400',
    bgClass: 'hover:bg-orange-50'
  },
  'Not applicable': {
    label: 'Not applicable',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    borderClass: 'border-slate-400',
    bgClass: 'hover:bg-slate-50'
  },
  'Other': {
    label: 'Other',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    borderClass: 'border-purple-400',
    bgClass: 'hover:bg-purple-50'
  }
};

export const HomeworkStatusModal: React.FC<HomeworkStatusModalProps> = ({
  isOpen,
  homework,
  onClose,
  onSaveStatus,
  currentInstructorName
}) => {
  const [selectedStatus, setSelectedStatus] = useState<HomeworkStatusValue>('Partially completed');
  const [customStatus, setCustomStatus] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !homework) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const finalStatus = selectedStatus === 'Other' && customStatus.trim() ? customStatus.trim() : selectedStatus;

    try {
      setSaving(true);
      await onSaveStatus(homework.id, finalStatus, note.trim() || undefined);
      setNote('');
      setCustomStatus('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save homework status');
    } finally {
      setSaving(false);
    }
  };

  let formattedAssignedDate = homework.assigned_date;
  try {
    formattedAssignedDate = format(parseISO(homework.assigned_date), 'dd MMM yyyy');
  } catch {}

  const history = homework.status_history || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-100 space-y-4 my-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-sky-600" />
              <span>Add Homework Status / Note</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Record progress or notes without overwriting earlier updates.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Homework Context Box */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              Original Homework Assignment
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedAssignedDate}
            </span>
          </div>
          <p className="text-slate-900 font-medium text-xs sm:text-sm bg-white p-2 rounded-lg border border-slate-200 whitespace-pre-wrap">
            {homework.homework_text}
          </p>
          {homework.latest_status && (
            <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-600">
              <span className="font-medium">Current Status:</span>
              <span className={`px-2 py-0.2 rounded-full font-bold border ${HOMEWORK_STATUS_CONFIG[homework.latest_status.status as HomeworkStatusValue]?.badgeClass || 'bg-slate-100 text-slate-800 border-slate-300'}`}>
                {homework.latest_status.status}
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Status Selection Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select New Status *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(HOMEWORK_STATUS_CONFIG) as HomeworkStatusValue[]).map((st) => {
                const isSelected = selectedStatus === st;
                const conf = HOMEWORK_STATUS_CONFIG[st];

                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStatus(st)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all border flex items-center justify-between ${
                      isSelected
                        ? `${conf.badgeClass} ring-2 ring-sky-500 shadow-xs`
                        : `bg-slate-50 border-slate-200 text-slate-700 ${conf.bgClass}`
                    }`}
                  >
                    <span>{conf.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedStatus === 'Other' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custom Status Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Parent requested extension"
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Note / Comments (Optional)</span>
              <span className="text-[11px] text-slate-400 font-normal">Visible in history & parent report</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Completed pages 7 and 11, pages 13-15 pending for next class..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Auto-record Note banner */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Instructor: <strong className="text-slate-700">{currentInstructorName || 'Current Instructor'}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {format(new Date(), 'dd MMM, HH:mm')}
            </span>
          </div>

          {/* Status History Timeline (if any exists) */}
          {history.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-500" />
                Previous Updates ({history.length})
              </h4>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {history.map((entry) => {
                  let dtStr = entry.created_at;
                  try {
                    dtStr = format(parseISO(entry.created_at), 'dd MMM yyyy, HH:mm');
                  } catch {}

                  const conf = HOMEWORK_STATUS_CONFIG[entry.status as HomeworkStatusValue] || {
                    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200'
                  };

                  return (
                    <div key={entry.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`px-2 py-0.2 rounded-full font-bold text-[10px] border ${conf.badgeClass}`}>
                          {entry.status}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {dtStr} • {entry.instructor_name || 'Instructor'}
                        </span>
                      </div>
                      {entry.note && (
                        <p className="text-slate-700 text-[11px] font-medium">{entry.note}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Record Status Update'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
