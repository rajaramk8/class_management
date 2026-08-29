import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { ParentReportData, ParentFeedbackRating } from '../types';
import { formatLevelDisplay } from '../constants/levels';
import { 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  GraduationCap, 
  Calendar, 
  Send, 
  PhoneCall, 
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const ParentReport: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  // PIN & Session State
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockedOut, setLockedOut] = useState(false);

  // Report Data
  const [report, setReport] = useState<ParentReportData | null>(null);

  // Expanded Class History Cards
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});

  // Feedback Form State
  const [rating, setRating] = useState<ParentFeedbackRating | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [contactRequested, setContactRequested] = useState(false);
  const [contactReason, setContactReason] = useState('progress');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Check sessionStorage for cached verified PIN
  useEffect(() => {
    if (!token) return;
    const sessionKey = `parent_pin_${token}`;
    const cachedPin = sessionStorage.getItem(sessionKey);
    if (cachedPin) {
      setPin(cachedPin);
      handleVerify(cachedPin);
    }
  }, [token]);

  const handleVerify = async (pinToVerify?: string) => {
    const pinCode = pinToVerify || pin;
    if (!token || !pinCode.trim()) {
      setError('Please enter your 4-digit PIN.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setLockedOut(false);

      const res = await api.verifyParentAccess(token, pinCode);

      if (res.success && res.report) {
        setReport(res.report);
        setIsVerified(true);
        sessionStorage.setItem(`parent_pin_${token}`, pinCode.trim());
      } else {
        setIsVerified(false);
        if (res.locked_out) {
          setLockedOut(true);
        }
        setError(res.error || 'Incorrect PIN. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to load report. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLock = () => {
    if (token) {
      sessionStorage.removeItem(`parent_pin_${token}`);
    }
    setIsVerified(false);
    setPin('');
    setReport(null);
  };

  const toggleClassExpand = (id: string) => {
    setExpandedClasses(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !pin) return;

    if (!rating && !feedbackText.trim() && !contactRequested) {
      alert('Please select a reaction or enter a note before submitting.');
      return;
    }

    try {
      setSubmittingFeedback(true);
      await api.submitParentFeedback({
        token,
        pin,
        rating,
        feedback_text: feedbackText.trim() || undefined,
        contact_requested: contactRequested,
        contact_reason: contactRequested ? contactReason : undefined,
      });

      setFeedbackSuccess(true);
      setFeedbackText('');
      setContactRequested(false);
      setTimeout(() => setFeedbackSuccess(false), 5000);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center shadow-md">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">Invalid Report Link</h2>
          <p className="text-sm text-slate-500 mt-2">
            No parent access token found. Please check the URL provided by your learning centre.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: PIN ENTRY SCREEN
  // =========================================================================
  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-slate-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-sky-100 shadow-xl p-6 sm:p-8 max-w-sm w-full">
          
          <div className="w-14 h-14 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md text-white">
            <Lock className="w-7 h-7" />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Student Progress Report
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter your access PIN to view your child's learning journey, homework, and class updates.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider text-center">
                Enter Security PIN
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. 1234"
                  autoFocus
                  className="w-full text-center tracking-[0.4em] font-mono text-2xl font-bold px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:font-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {lockedOut && (
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-center">
                Access temporarily locked due to repeated attempts. Please try again in a few minutes.
              </p>
            )}

            <button
              type="submit"
              disabled={loading || lockedOut || !pin}
              className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Verifying PIN...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>View Progress Report</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Need help or forgot your PIN? Contact your learning centre instructor.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const { student, summary, recent_classes, pending_homework, completed_homework, last_updated } = report;

  // Format Level displays for cards
  const englishLevelDisplay = formatLevelDisplay({
    subjectName: 'English',
    englishLevel: student.english_level,
  });

  const mathLevelDisplay = formatLevelDisplay({
    subjectName: 'Math',
    btmLevel: student.btm_level,
    ctmLevel: student.ctm_level,
  });

  // =========================================================================
  // VIEW 2: PROGRESS REPORT DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-tr from-sky-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-base shadow-xs">
              {student.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                {student.name}
              </h1>
              <p className="text-[11px] text-slate-500">Learning Progress Report</p>
            </div>
          </div>

          <button
            onClick={handleLock}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            title="Lock report"
          >
            <Lock className="w-3.5 h-3.5 text-slate-600" />
            <span>Lock</span>
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-3.5 sm:px-4 py-4 space-y-4 sm:space-y-6">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-sky-600 to-indigo-600 rounded-2xl p-4 sm:p-5 text-white shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full mb-2">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Student Progress Portal</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Hello, {student.name}'s Family! 👋
            </h2>
            <p className="text-xs sm:text-sm text-sky-100 mt-1 max-w-lg">
              Here is your child's up-to-date learning record, current levels, and recent classwork.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-sky-200 mt-3">
              <Calendar className="w-3.5 h-3.5" />
              <span>Last updated: {last_updated}</span>
            </div>
          </div>
        </div>

        {/* Current Learning Levels Card */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3.5">
            <GraduationCap className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Current Curriculum Levels
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* English Level */}
            <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-3.5">
              <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block mb-1">
                English
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-bold text-sky-950">
                  {englishLevelDisplay}
                </span>
              </div>
              <p className="text-[11px] text-sky-700/80 mt-1">
                {student.english_level && student.english_level !== 'None'
                  ? 'Active reading, vocabulary & comprehension'
                  : 'Not enrolled in English'}
              </p>
            </div>

            {/* Math Level */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5">
              <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block mb-1">
                Mathematics
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-bold text-indigo-950">
                  {mathLevelDisplay}
                </span>
              </div>
              <p className="text-[11px] text-indigo-700/80 mt-1">
                {student.btm_level && student.btm_level !== 'None'
                  ? 'Basic & Critical Thinking Math curriculum'
                  : 'Not enrolled in Math'}
              </p>
            </div>
          </div>
        </section>

        {/* Month-at-a-Glance Metrics */}
        <section>
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              This Month's Activity
            </h3>
            <span className="text-[11px] text-slate-400">
              {summary.total_classes} all-time classes
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs text-center">
              <BookOpen className="w-4 h-4 text-sky-600 mx-auto mb-1" />
              <p className="text-xl sm:text-2xl font-bold text-slate-900">{summary.classes_this_month}</p>
              <p className="text-[10px] text-slate-500 font-medium">Classes Attended</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs text-center">
              <Clock className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
              <p className="text-xl sm:text-2xl font-bold text-slate-900">{summary.hours_this_month} <span className="text-xs font-medium text-slate-400">hrs</span></p>
              <p className="text-[10px] text-slate-500 font-medium">Learning Hours</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs text-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <p className="text-xl sm:text-2xl font-bold text-emerald-600">{summary.homework_completed}</p>
              <p className="text-[10px] text-slate-500 font-medium">HW Completed</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs text-center">
              <AlertCircle className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <p className="text-xl sm:text-2xl font-bold text-amber-600">{summary.homework_pending}</p>
              <p className="text-[10px] text-slate-500 font-medium">HW Pending</p>
            </div>
          </div>
        </section>

        {/* Homework Section */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Homework & Assignments
              </h3>
            </div>
            {pending_homework.length > 0 && (
              <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                {pending_homework.length} To Review
              </span>
            )}
          </div>

          {/* Pending Homework */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Pending / Current Assignments</span>
            </h4>

            {pending_homework.length === 0 ? (
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 text-center">
                <p className="text-xs font-semibold text-emerald-900">
                  🎉 Great job! There is no pending homework right now.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {pending_homework.map((hw) => (
                  <div 
                    key={hw.id}
                    className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-left"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-bold text-amber-950 bg-amber-100 px-2 py-0.5 rounded">
                        {hw.subject?.name}
                      </span>
                      {hw.class_update?.booklet_number && (
                        <span className="text-xs text-amber-800 font-mono font-medium">
                          Booklet {hw.class_update.booklet_number}
                        </span>
                      )}
                      <span className="text-[11px] text-amber-800/80 ml-auto">
                        Assigned: {hw.assigned_date}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 whitespace-pre-wrap">
                      {hw.homework_text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Homework History */}
          {completed_homework.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <details className="group">
                <summary className="flex items-center justify-between text-xs font-bold text-slate-600 cursor-pointer list-none select-none py-1">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Completed Homework History ({completed_homework.length})
                  </span>
                  <span className="text-sky-600 text-xs font-semibold group-open:hidden">Show</span>
                  <span className="text-sky-600 text-xs font-semibold hidden group-open:inline">Hide</span>
                </summary>

                <div className="space-y-2 mt-2.5">
                  {completed_homework.map((hw) => (
                    <div key={hw.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
                      <div className="flex items-center justify-between gap-2 text-slate-500 mb-1">
                        <span className="font-semibold text-slate-700">{hw.subject?.name}</span>
                        <span className="text-emerald-700 font-medium">
                          ✓ Checked {hw.checked_date ? `on ${hw.checked_date}` : ''}
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium">{hw.homework_text}</p>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </section>

        {/* Recent Classes List */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Recent Classes & Topics
              </h3>
            </div>
            <span className="text-xs text-slate-400">Latest {recent_classes.length}</span>
          </div>

          {recent_classes.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No recent class records found.</p>
          ) : (
            <div className="space-y-2.5">
              {recent_classes.map((c) => {
                const isExpanded = !!expandedClasses[c.id];
                const levelDisplay = formatLevelDisplay({
                  subjectName: c.subject?.name,
                  englishLevel: c.english_level,
                  btmLevel: c.btm_level,
                  ctmLevel: c.ctm_level,
                });

                return (
                  <div 
                    key={c.id}
                    className="border border-slate-200 rounded-xl p-3.5 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">
                            {c.class_date}
                          </span>
                          <span className="text-[11px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                            {c.subject?.name}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            {levelDisplay}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span>Instructor: <strong className="text-slate-700">{c.instructor?.name || 'Instructor'}</strong></span>
                          <span>•</span>
                          <span>{c.duration_minutes} mins</span>
                          {c.booklet_number && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-slate-600">Booklet {c.booklet_number}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {(c.cw || c.hw) && (
                        <button
                          type="button"
                          onClick={() => toggleClassExpand(c.id)}
                          className="text-xs font-semibold text-sky-600 hover:text-sky-800 p-1 shrink-0 flex items-center gap-0.5"
                        >
                          <span>{isExpanded ? 'Less' : 'Details'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>

                    {/* Expandable Classwork & Homework */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
                        {c.cw && (
                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                            <span className="font-bold text-slate-700 block mb-0.5">Classwork (CW):</span>
                            <p className="text-slate-800 whitespace-pre-wrap">{c.cw}</p>
                          </div>
                        )}
                        {c.hw && (
                          <div className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200">
                            <span className="font-bold text-amber-900 block mb-0.5">Assigned Homework:</span>
                            <p className="text-slate-900 whitespace-pre-wrap">{c.hw}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Parent Feedback & Voice Section */}
        <section className="bg-gradient-to-br from-white to-sky-50/60 rounded-2xl border-2 border-sky-200 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Parent Feedback & Comments
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            How are you feeling about {student.name}'s learning progress? We value your thoughts!
          </p>

          {feedbackSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Thank you! Your feedback has been sent to our teaching team.</span>
            </div>
          )}

          <form onSubmit={handleSubmitFeedback} className="space-y-3.5">
            
            {/* Quick 1-Tap Reaction */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Quick Feeling:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRating('good')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                    rating === 'good'
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-900 ring-2 ring-emerald-400'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg">👍</span>
                  <span>Doing Great!</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRating('okay')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                    rating === 'okay'
                      ? 'bg-amber-100 border-amber-400 text-amber-900 ring-2 ring-amber-400'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg">😐</span>
                  <span>Okay / Neutral</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRating('needs_attention')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                    rating === 'needs_attention'
                      ? 'bg-rose-100 border-rose-400 text-rose-900 ring-2 ring-rose-400'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg">👎</span>
                  <span>Needs Attention</span>
                </button>
              </div>
            </div>

            {/* Written Feedback Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tell us more (Optional):
              </label>
              <textarea
                rows={3}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="e.g. He is enjoying the math questions, but needs extra guidance on reading vocabulary..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            {/* Request a Call Option */}
            <div className="bg-white/80 border border-slate-200 rounded-xl p-3 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={contactRequested}
                  onChange={(e) => setContactRequested(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5 text-sky-600" />
                  Would you like our instructor/director to contact you?
                </span>
              </label>

              {contactRequested && (
                <div className="pt-1.5">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Reason for Call / Follow-up:
                  </label>
                  <select
                    value={contactReason}
                    onChange={(e) => setContactReason(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="progress">Discuss overall progress & level advancement</option>
                    <option value="homework">Homework pacing or difficulty</option>
                    <option value="difficulty">Child is struggling with a specific topic</option>
                    <option value="general">General feedback / schedule query</option>
                    <option value="other">Other reason</option>
                  </select>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submittingFeedback || (!rating && !feedbackText.trim() && !contactRequested)}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {submittingFeedback ? (
                <span>Sending Feedback...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>
          </form>
        </section>

      </main>
    </div>
  );
};
