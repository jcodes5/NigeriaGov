
"use client";

import type { User as AppUser } from '@/types'; // Our application's user type
import type { User as AuthUser, Session } from '@supabase/supabase-js'; // Supabase Auth user type
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getUserProfile } from '@/lib/actions'; // Server action to get profile from Prisma

interface AuthContextType {
  authUser: AuthUser | null; // Supabase authenticated user
  profile: AppUser | null;   // Profile from our public 'users' table
  isAdmin: boolean;
  logout: () => Promise<void>;
  isLoading: boolean;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        const currentSupabaseUser = session?.user ?? null;
        setAuthUser(currentSupabaseUser);

        if (currentSupabaseUser) {
          // Fetch profile from our public users table
          const userProfile = await getUserProfile(currentSupabaseUser.id);
          setProfile(userProfile);
          setIsAdmin(userProfile?.role === 'admin');
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
        setIsLoading(false);
      }
    );

    // Initial check
    const checkInitialSession = async () => {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        const currentSupabaseUser = initialSession?.user ?? null;
        setAuthUser(currentSupabaseUser);

        if (currentSupabaseUser) {
            const userProfile = await getUserProfile(currentSupabaseUser.id);
            setProfile(userProfile);
            setIsAdmin(userProfile?.role === 'admin');
        } else {
            setProfile(null);
            setIsAdmin(false);
        }
        setIsLoading(false);
    };
    checkInitialSession();


    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setAuthUser(null);
    setProfile(null);
    setIsAdmin(false);
    setSession(null);
    setIsLoading(false);
    // No need to remove from localStorage, Supabase client handles it
  };
  
  // The login function is removed as auth state is now driven by Supabase events.
  // Forms will call Supabase methods directly.

  return (
    <AuthContext.Provider value={{ authUser, profile, isAdmin, logout, isLoading, session }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
