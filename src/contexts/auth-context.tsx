"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Promise cache for Suspense
let authPromise: Promise<void> | null = null;
let authData: { user: User | null; profile: Profile | null } | null = null;

interface User {
  id: string;
  email: string;
}

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    if (!authPromise) {
      authPromise = checkAuth();
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          authData = { user: data.user, profile: data.profile };
          setUser(data.user);
          setProfile(data.profile);
        } else {
          authData = { user: null, profile: null };
        }
      } else {
        authData = { user: null, profile: null };
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      authData = { user: null, profile: null };
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
      authPromise = null; // Clear the promise cache
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    if (!data.success) {
      throw new Error(data.error || 'Login failed');
    }

    authData = { user: data.user, profile: data.profile };
    setUser(data.user);
    setProfile(data.profile);
  };

  const logout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authData = { user: null, profile: null };
      setUser(null);
      setProfile(null);
      router.push('/login');
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  const value = {
    user,
    profile,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Throw promise for Suspense if still loading and no cached data
  if (context.isLoading && authPromise && !authData) {
    throw authPromise;
  }
  
  return context;
}

// Hook for components that require authentication
export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  return { user, isLoading };
}