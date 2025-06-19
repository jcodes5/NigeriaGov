
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
        console.log("AuthProvider: onAuthStateChange event:", event, "session:", session);
        setSession(session);
        const currentSupabaseUser = session?.user ?? null;
        setAuthUser(currentSupabaseUser);

        if (currentSupabaseUser) {
          try {
            const userProfile = await getUserProfile(currentSupabaseUser.id);
            setProfile(userProfile);
            setIsAdmin(userProfile?.role === 'admin');
          } catch (profileError) {
            console.error("AuthProvider: Error fetching user profile in onAuthStateChange:", profileError);
            setProfile(null);
            setIsAdmin(false);
          }
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
        setIsLoading(false);
      }
    );

    // Initial check
    const checkInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
            console.error("AuthProvider: Error fetching initial session from Supabase:", sessionError);
            // If getSession fails, it might indicate a network issue or misconfiguration early on.
            // We still set authUser to null and proceed, as onAuthStateChange might recover later
            // or this indicates a persistent problem.
            setAuthUser(null);
            setProfile(null);
            setIsAdmin(false);
            setIsLoading(false);
            return;
        }
        
        console.log("AuthProvider: Initial session data:", initialSession);
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
      } catch (error) {
        // Catch any other unexpected errors during initial session check
        console.error("AuthProvider: Unexpected error during checkInitialSession:", error);
        setAuthUser(null);
        setProfile(null);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkInitialSession();


    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("AuthProvider: Error during sign out:", error);
      }
    } catch (e) {
      console.error("AuthProvider: Unexpected error during sign out:", e);
    }
    setAuthUser(null);
    setProfile(null);
    setIsAdmin(false);
    setSession(null);
    setIsLoading(false);
  };
  

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

