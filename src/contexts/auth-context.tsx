"use client";

import React, { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

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

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string;
  features: any;
}

interface Subscription {
  id: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  plan: Plan;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  subscription: Subscription | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPremiumSubscription: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth query keys for consistent caching
const authKeys = {
  me: ["auth", "me"] as const,
};

// Fetch current user function
async function fetchCurrentUser() {
  const response = await fetch("/api/me", {
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      return null; // Not authenticated
    }
    throw new Error("Failed to fetch user data");
  }

  const data = await response.json();
  return data.success
    ? {
        user: data.user,
        profile: data.profile,
        subscription: data.subscription,
      }
    : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Use React Query for auth state management with instant navigation
  const {
    data: authData,
    isLoading,
    error,
  } = useQuery({
    queryKey: authKeys.me,
    queryFn: fetchCurrentUser,
    staleTime: 60 * 60 * 1000, // 1 hour - don't refetch for 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours - keep in cache for 24 hours
    retry: (failureCount, error: any) => {
      // Don't retry on 401 (unauthorized)
      if (error?.message?.includes("401") || error?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
    placeholderData: (previousData) => previousData, // Keep previous data during refetch
    networkMode: "offlineFirst", // Use cache first for instant navigation
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (!data.success) {
        throw new Error(data.error || "Login failed");
      }

      return {
        user: data.user,
        profile: data.profile,
        subscription: data.subscription,
      };
    },
    onSuccess: (data) => {
      // Update the auth cache with new user data
      queryClient.setQueryData(authKeys.me, data);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    },
    onSuccess: () => {
      // Clear auth cache and redirect
      queryClient.setQueryData(authKeys.me, null);
      router.push("/login");
    },
    onError: (error) => {
      console.error("Logout error:", error);
      // Even if logout fails, clear local state and redirect
      queryClient.setQueryData(authKeys.me, null);
      router.push("/login");
    },
  });

  // Extract user, profile, and subscription from auth data
  const user = authData?.user || null;
  const profile = authData?.profile || null;
  const subscription = authData?.subscription || null;

  // Determine if user has premium subscription
  const hasPremiumSubscription =
    subscription && subscription.plan.name.toLowerCase() !== "free";

  // Auth functions
  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const refreshUser = async () => {
    await queryClient.invalidateQueries({ queryKey: authKeys.me });
  };

  const value = {
    user,
    profile,
    subscription,
    isLoading,
    login,
    logout,
    refreshUser,
    hasPremiumSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

// Hook for components that require authentication
export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  return { user, isLoading };
}
