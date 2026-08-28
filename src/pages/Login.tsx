import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { BookOpen, Lock, Mail, ArrowRight, UserCheck, ShieldCheck, Database, Info } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signInWithSupabase, signInDemo } = useAuth();
  const navigate = useNavigate();

  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError('Supabase connection URL/Key not detected. Please use the Instant Test Sandbox buttons below or configure your .env file.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await signInWithSupabase(email, password);
      navigate('/');
    } catch (err: any) {
      console.error('[Login] Error during sign-in:', err);
      setError(err.message || 'Login failed. Please verify your email and password in Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: 'instructor' | 'admin') => {
    signInDemo(role);
    navigate('/');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-sky-600 text-white rounded-2xl shadow-md mb-3">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Class Updates & Tracking</h2>
          <p className="text-sm text-slate-500 mt-1">Sign in to record and manage class records</p>
        </div>

        {/* Backend Connection Status Badge */}
        <div className="mb-4 flex items-center justify-center">
          {isSupabaseConfigured ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-full shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Connected to Live Supabase Backend
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium rounded-full shadow-2xs">
              <Database className="w-3.5 h-3.5 text-amber-600" />
              Offline / Local Sandbox Mode (No .env detected)
            </span>
          )}
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium leading-relaxed">
              <span className="font-bold block mb-0.5">Authentication Error:</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSupabaseLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="rajaram.class@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Sign In with Supabase</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-medium">Instant Test Sandbox</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => handleDemoLogin('instructor')}
              className="w-full py-2.5 px-4 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-sky-600" />
                <span>Sandbox: Log in as Instructor (Raj)</span>
              </div>
              <span className="text-sky-600 font-bold">1-Click</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="w-full py-2.5 px-4 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Sandbox: Log in as Administrator</span>
              </div>
              <span className="text-indigo-600 font-bold">1-Click</span>
            </button>
          </div>

          <div className="mt-4 p-2.5 bg-slate-50 rounded-lg flex items-start gap-2 text-[11px] text-slate-500">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              <strong>Instant Sandbox:</strong> Uses local mock storage to let you test and preview UI features immediately without entering credentials.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
