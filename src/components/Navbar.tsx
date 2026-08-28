import React, { useState } from 'react';
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
  Sparkles,
  KeyRound,
  Menu,
  X
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { ChangePasswordModal } from './ChangePasswordModal';

export const Navbar: React.FC = () => {
  const { user, currentInstructor, signOut, signInDemo } = useAuth();
  const location = useLocation();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/new-class', label: 'New Class', icon: PlusCircle },
    { path: '/history', label: 'History', icon: History },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
    ...(user?.role === 'admin' ? [{ path: '/admin', label: 'Admin', icon: ShieldCheck }] : []),
  ];

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 no-print shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-sky-600 font-bold text-lg focus:outline-none"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="bg-sky-600 text-white p-1.5 rounded-lg shadow-xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="tracking-tight text-slate-800 font-bold text-base sm:text-lg">ClassTracker</span>
              </Link>

              {/* Desktop Nav Links */}
              {user && (
                <nav className="hidden md:flex gap-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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

            {/* Right Side Header Items */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Supabase status badge */}
              <div className="hidden lg:flex items-center">
                {isSupabaseConfigured ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Supabase Live
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200" title="Running in local sandbox mode.">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Local Sandbox
                  </span>
                )}
              </div>

              {user ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Desktop User Info */}
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-slate-800 leading-tight">
                      {currentInstructor?.name || user.full_name}
                    </div>
                    <div className="text-[11px] text-slate-500 capitalize">
                      {user.role} {currentInstructor ? `(${currentInstructor.name})` : ''}
                    </div>
                  </div>

                  {/* Change Password button (Desktop) */}
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 border border-slate-200 rounded-lg text-xs font-medium transition-colors"
                    title="Change Password"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-sky-600" />
                    <span>Password</span>
                  </button>

                  {/* Sign Out (Desktop) */}
                  <button
                    onClick={() => signOut()}
                    className="hidden sm:inline-flex items-center gap-1.5 p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-sm transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>

                  {/* Mobile Menu Toggle Button */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
                    aria-label="Toggle navigation menu"
                  >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-xs transition-colors"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && user && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
            {/* User Details Header in Mobile Drawer */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                  {(currentInstructor?.name || user.full_name || 'U').charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 leading-tight">
                    {currentInstructor?.name || user.full_name}
                  </div>
                  <div className="text-xs text-slate-500 capitalize">
                    {user.role} {currentInstructor ? `(${currentInstructor.name})` : ''}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setIsPasswordModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="p-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 border border-slate-200 rounded-lg text-xs"
                  title="Change Password"
                >
                  <KeyRound className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-lg text-xs"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile Nav Links */}
            <div className="grid grid-cols-1 gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Sandbox toggle for demo mode */}
            {!isSupabaseConfigured && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    signInDemo(user.role === 'admin' ? 'instructor' : 'admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Switch to {user.role === 'admin' ? 'Instructor' : 'Admin'} Mode
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Mobile Bottom Fixed Navigation Bar (Fast 1-Thumb Switching) */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex justify-around items-center shadow-lg no-print">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-lg transition-colors ${
                  isActive ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-sky-600 scale-110' : 'text-slate-400'} transition-transform`} />
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Change Password Modal */}
      {user && (
        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          userEmail={user.email}
        />
      )}
    </>
  );
};
