import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, Instructor } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: UserProfile | null;
  currentInstructor: Instructor | null;
  loading: boolean;
  signInWithSupabase: (email: string, password: string) => Promise<void>;
  signInDemo: (role: 'instructor' | 'admin', instructorId?: string) => void;
  signOut: () => Promise<void>;
  setCurrentInstructor: (inst: Instructor | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentInstructor, setCurrentInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to load profile and link instructor
  const resolveUserProfile = async (authUser: { id: string; email?: string; user_metadata?: any }): Promise<UserProfile> => {
    const email = authUser.email || '';
    console.log(`[Auth] Resolving profile for ${email} (ID: ${authUser.id})...`);

    let profile: UserProfile | null = null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        console.warn('[Auth] Error fetching profile from public.profiles table:', error.message);
      }
      profile = data;
    } catch (err) {
      console.warn('[Auth] Failed to query public.profiles:', err);
    }

    const instructors = await api.getInstructors();
    const matchedInst = instructors.find(
      i => i.email?.trim().toLowerCase() === email.trim().toLowerCase()
    );

    const isAdmin = 
      email.toLowerCase().includes('admin') || 
      email.toLowerCase() === 'rajaram.class@gmail.com' ||
      profile?.role === 'admin';

    const finalRole = isAdmin ? 'admin' : (profile?.role || 'instructor');
    const finalFullName = profile?.full_name || matchedInst?.name || authUser.user_metadata?.full_name || email.split('@')[0];
    const finalInstructorId = profile?.instructor_id || matchedInst?.id || null;

    const resolvedProfile: UserProfile = {
      id: authUser.id,
      email: email,
      full_name: finalFullName,
      role: finalRole,
      instructor_id: finalInstructorId,
    };

    // If profile row didn't exist in Supabase DB, auto-upsert it for future queries
    if (!profile && isSupabaseConfigured) {
      console.log('[Auth] Creating missing public.profiles entry in database...');
      supabase
        .from('profiles')
        .upsert([resolvedProfile])
        .then(({ error }: { error: any }) => {
          if (error) console.warn('[Auth] Note: Could not auto-upsert profile:', error.message);
          else console.log('[Auth] Profile successfully auto-created in database.');
        });
    }

    if (matchedInst) {
      setCurrentInstructor(matchedInst);
    } else if (finalInstructorId) {
      const found = instructors.find(i => i.id === finalInstructorId);
      if (found) setCurrentInstructor(found);
    }

    setUser(resolvedProfile);
    return resolvedProfile;
  };

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    async function initAuth() {
      console.log(`[Auth] Initializing Auth... (Supabase configured: ${isSupabaseConfigured})`);
      
      if (isSupabaseConfigured) {
        try {
          // 1. Check existing session
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error('[Auth] Error getting session:', error.message);
          }

          if (session?.user) {
            console.log('[Auth] Active session found for user:', session.user.email);
            await resolveUserProfile(session.user);
          } else {
            console.log('[Auth] No active session found. Waiting for login.');
            setUser(null);
            setCurrentInstructor(null);
          }

          // 2. Listen to live auth state changes (login, logout, token refresh)
          const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`[Auth] Auth state changed: ${event}`, session?.user?.email);
            if (session?.user) {
              await resolveUserProfile(session.user);
            } else {
              setUser(null);
              setCurrentInstructor(null);
            }
          });

          subscription = authListener.subscription;
        } catch (err) {
          console.error('[Auth] Unexpected error in initAuth:', err);
        }
      } else {
        // Fallback demo mock user when not configured with Supabase
        const instructors = await api.getInstructors();
        const defaultInst = instructors.find(i => i.name.toLowerCase() === 'raj') || 
                            instructors.find(i => i.name.toLowerCase() === 'shriyam') || 
                            instructors[0];
        setUser({
          id: `demo-user-${defaultInst?.id || 'raj'}`,
          email: defaultInst?.email || 'rajaram.class@gmail.com',
          full_name: defaultInst?.name || 'Raj',
          role: 'admin',
          instructor_id: defaultInst?.id
        });
        if (defaultInst) setCurrentInstructor(defaultInst);
      }

      setLoading(false);
    }

    initAuth();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // Supabase Login Method
  const signInWithSupabase = async (email: string, password: string) => {
    console.log(`[Auth] Attempting Supabase sign in for: ${email}`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      console.error('[Auth] Sign in failed:', error.message);
      throw error;
    }

    if (data.user) {
      console.log('[Auth] Sign in successful, resolving profile...');
      await resolveUserProfile(data.user);
    }
  };

  // Instant Test Sandbox Login
  const signInDemo = async (role: 'instructor' | 'admin', instructorId?: string) => {
    console.log(`[Auth] Sandbox test login initiated (Role: ${role})`);
    const instructors = await api.getInstructors();
    let inst = instructors.find(i => i.id === instructorId);
    if (!inst && role === 'instructor') {
      inst = instructors.find(i => i.name.toLowerCase() === 'raj') || 
             instructors.find(i => i.name.toLowerCase() === 'shriyam') || 
             instructors[0];
    } else if (role === 'admin') {
      inst = instructors.find(i => i.email?.toLowerCase().includes('admin') || i.name.toLowerCase() === 'raj') || instructors[0];
    }

    const newUser: UserProfile = {
      id: role === 'admin' ? 'demo-user-admin' : `demo-user-${inst?.id || 'instructor'}`,
      email: role === 'admin' ? 'admin@example.com' : (inst?.email || 'rajaram.class@gmail.com'),
      full_name: role === 'admin' ? 'System Administrator (Raj)' : (inst?.name || 'Raj'),
      role: role,
      instructor_id: inst?.id || null
    };

    setUser(newUser);
    setCurrentInstructor(inst || null);
  };

  const signOut = async () => {
    console.log('[Auth] Signing out...');
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setCurrentInstructor(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      currentInstructor, 
      loading, 
      signInWithSupabase,
      signInDemo, 
      signOut, 
      setCurrentInstructor 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
