import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, Instructor } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: UserProfile | null;
  currentInstructor: Instructor | null;
  loading: boolean;
  signInDemo: (role: 'instructor' | 'admin', instructorId?: string) => void;
  signOut: () => Promise<void>;
  setCurrentInstructor: (inst: Instructor | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentInstructor, setCurrentInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser(profile);
            if (profile.instructor_id) {
              const instructors = await api.getInstructors();
              const matched = instructors.find(i => i.id === profile.instructor_id);
              if (matched) setCurrentInstructor(matched);
            }
          }
        }
      } else {
        // Fallback default demo user (Raj or Shriyam)
        const instructors = await api.getInstructors();
        const defaultInst = instructors.find(i => i.name.toLowerCase() === 'raj') || 
                            instructors.find(i => i.name.toLowerCase() === 'shriyam') || 
                            instructors[0];
        setUser({
          id: `demo-user-${defaultInst?.id || 'raj'}`,
          email: defaultInst?.email || 'raj@example.com',
          full_name: defaultInst?.name || 'Raj',
          role: 'instructor',
          instructor_id: defaultInst?.id
        });
        if (defaultInst) setCurrentInstructor(defaultInst);
      }
      setLoading(false);
    }

    initAuth();
  }, []);

  const signInDemo = async (role: 'instructor' | 'admin', instructorId?: string) => {
    const instructors = await api.getInstructors();
    let inst = instructors.find(i => i.id === instructorId);
    if (!inst && role === 'instructor') {
      inst = instructors.find(i => i.name.toLowerCase() === 'raj') || 
             instructors.find(i => i.name.toLowerCase() === 'shriyam') || 
             instructors[0];
    } else if (role === 'admin') {
      inst = instructors.find(i => i.name.toLowerCase().includes('admin')) || instructors[0];
    }

    const newUser: UserProfile = {
      id: role === 'admin' ? 'demo-user-admin' : `demo-user-${inst?.id || 'instructor'}`,
      email: role === 'admin' ? 'admin@example.com' : (inst?.email || 'instructor@example.com'),
      full_name: role === 'admin' ? 'System Administrator' : (inst?.name || 'Instructor'),
      role: role,
      instructor_id: inst?.id || null
    };

    setUser(newUser);
    setCurrentInstructor(inst || null);
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setCurrentInstructor(null);
  };

  return (
    <AuthContext.Provider value={{ user, currentInstructor, loading, signInDemo, signOut, setCurrentInstructor }}>
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
