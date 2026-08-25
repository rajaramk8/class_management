import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  PlusCircle, 
  History, 
  BarChart3, 
  ShieldCheck, 
  User, 
  LogOut, 
  Sparkles
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export const Navbar: React.FC = () => {
  const { user, currentInstructor, signOut, signInDemo } = useAuth();
  const location = useLocation();

  const navLinks = [
    { path: '/new-class', label: 'New Class Update', icon: PlusCircle },
    { path: '/history', label: 'Class History', icon: History },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
    ...(user?.role === 'admin' ? [{ path: '/admin', label: 'Admin Panel', icon: ShieldCheck }] : []),
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 no-print shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-sky-600 font-bold text-lg">
              <div className="bg-sky-600 text-white p-1.5 rounded-lg shadow-sm">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="tracking-tight text-slate-800">ClassTracker</span>
            </Link>

            {user && (
              <nav className="hidden md:flex gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-sky-50 text-sky-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Supabase status badge */}
            <div className="hidden lg:flex items-center">
              {isSupabaseConfigured ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Supabase Live
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200" title="Running in local sandbox mode. Connect Supabase via .env anytime.">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Local Sandbox
                </span>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-slate-800">
                    {currentInstructor?.name || user.full_name}
                  </div>
                  <div className="text-xs text-slate-500 capitalize">
                    {user.role} {currentInstructor ? `(Instructor)` : ''}
                  </div>
                </div>

                {/* Quick Role switcher for testing */}
                {!isSupabaseConfigured && (
                  <button
                    onClick={() => signInDemo(user.role === 'admin' ? 'instructor' : 'admin')}
                    className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
                    title="Toggle Demo Role"
                  >
                    Switch to {user.role === 'admin' ? 'Instructor' : 'Admin'}
                  </button>
                )}

                <button
                  onClick={() => signOut()}
                  className="inline-flex items-center gap-1.5 p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md text-sm transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
              >
                <User className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
