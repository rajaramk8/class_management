import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { ClassUpdate, Homework } from '../types';
import { formatLevelDisplay } from '../constants/levels';
import { 
  PlusCircle, 
  History, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { format } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { user, currentInstructor } = useAuth();
  const [recentClasses, setRecentClasses] = useState<ClassUpdate[]>([]);
  const [pendingHomeworkList, setPendingHomeworkList] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [classes, hw] = await Promise.all([
          api.getClassUpdates(),
          api.getHomeworkList(),
        ]);
        setRecentClasses(classes.slice(0, 5));
        setPendingHomeworkList(hw.filter(h => !h.checked).slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm mb-3">
            <Calendar className="w-3.5 h-3.5" />
            {format(new Date(), 'EEEE, dd MMMM yyyy')}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {currentInstructor?.name || user?.full_name || 'Instructor'}!
          </h1>
          <p className="text-sky-100 text-sm sm:text-base mt-2">
            Record class updates, review unchecked student homework, and track learning progress with zero delay.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              to="/new-class"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-sky-700 hover:bg-sky-50 font-semibold rounded-xl text-sm shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              New Class Update
            </Link>
            <Link
              to="/history"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-700/60 hover:bg-sky-700/80 text-white font-medium rounded-xl text-sm backdrop-blur-sm transition-colors"
            >
              <History className="w-4 h-4" />
              View Class History
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Class Updates */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-600" />
                Recent Class Updates
              </h2>
              <Link to="/history" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-slate-400 text-sm">Loading recent classes...</div>
              ) : recentClasses.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">No class updates logged yet.</div>
              ) : (
                recentClasses.map((cu) => {
                  const levelDisplay = formatLevelDisplay({
                    subjectName: cu.subject?.name,
                    englishLevel: cu.english_level,
                    btmLevel: cu.btm_level,
                    ctmLevel: cu.ctm_level,
                    levelName: cu.level?.name,
                  });

                  return (
                    <div key={cu.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 text-sm">{cu.student?.name}</span>
                          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {cu.class_date}
                          </span>
                          <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                            {cu.subject?.name}
                          </span>
                          <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {levelDisplay}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                          <span className="font-medium text-slate-700">CW:</span> {cu.cw || 'No notes'}
                        </p>
                        {cu.hw && (
                          <p className="text-xs text-indigo-700 mt-0.5 line-clamp-1">
                            <span className="font-medium">HW:</span> {cu.hw}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-semibold text-slate-700">
                          {cu.duration_minutes} mins
                        </span>
                        <p className="text-xs text-slate-400">By {cu.instructor?.name}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Pending Homework Watchlist */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Pending Homework
              </h2>
              <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                {pendingHomeworkList.length} Unchecked
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-slate-400 text-sm">Loading homework...</div>
              ) : pendingHomeworkList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  All homework is up to date!
                </div>
              ) : (
                pendingHomeworkList.map((hw) => (
                  <div key={hw.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-800 text-xs">{hw.student?.name}</span>
                      <span className="text-xs text-slate-400">{hw.assigned_date}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium whitespace-pre-wrap">{hw.homework_text}</p>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <Link
                to="/new-class"
                className="text-xs font-semibold text-sky-600 hover:text-sky-700"
              >
                + Check homework in New Class screen
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
