"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WaitlistInput } from "@/lib/services/waitlist.service";

// Types
interface WaitlistEntry {
  id: string;
  email: string;
  source: string;
  metadata: Record<string, any>;
  createdAt: string;
}

interface WaitlistStats {
  total: number;
  todayCount: number;
  weekCount: number;
  monthCount: number;
  sources: Record<string, number>;
}

interface AddToWaitlistResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
    createdAt: string;
    source: string;
  };
}

// Query key factory
const waitlistKeys = {
  all: ["waitlist"] as const,
  stats: () => [...waitlistKeys.all, "stats"] as const,
  entries: () => [...waitlistKeys.all, "entries"] as const,
  entry: (email: string) => [...waitlistKeys.all, "entry", email] as const,
} as const;

// API functions
async function addToWaitlist(
  data: WaitlistInput
): Promise<AddToWaitlistResponse> {
  const response = await fetch("/api/waitlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to join waitlist");
  }

  return response.json();
}

async function removeFromWaitlist(
  email: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch("/api/waitlist", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to remove from waitlist");
  }

  return response.json();
}

async function fetchWaitlistStats(): Promise<WaitlistStats> {
  const response = await fetch("/api/waitlist");

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch waitlist stats");
  }

  const data = await response.json();
  return data.data;
}

/**
 * Hook for adding email to waitlist
 * Handles API calls, optimistic updates, and user feedback
 */
export function useAddToWaitlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToWaitlist,
    onMutate: async (newEntry) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: waitlistKeys.stats() });

      // Snapshot previous value
      const previousStats = queryClient.getQueryData(waitlistKeys.stats());

      // Optimistically update stats
      queryClient.setQueryData(
        waitlistKeys.stats(),
        (old: WaitlistStats | undefined) => {
          if (!old) return old;

          return {
            ...old,
            total: old.total + 1,
            todayCount: old.todayCount + 1,
            sources: {
              ...old.sources,
              [newEntry.source || "landing-page"]:
                (old.sources[newEntry.source || "landing-page"] || 0) + 1,
            },
          };
        }
      );

      return { previousStats };
    },
    onError: (error, newEntry, context) => {
      // Rollback on error
      if (context?.previousStats) {
        queryClient.setQueryData(waitlistKeys.stats(), context.previousStats);
      }

      toast.error("Failed to join waitlist");
    },
    onSuccess: (data) => {
      toast.success("Successfully joined waitlist!");
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: waitlistKeys.stats() });
    },
  });
}

/**
 * Hook for removing email from waitlist
 * Handles API calls and cache invalidation
 */
export function useRemoveFromWaitlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFromWaitlist,
    onSuccess: (data) => {
      toast.success("Removed from waitlist", {
        description: data.message,
      });
    },
    onError: (error) => {
      toast.error("Failed to remove from waitlist", {
        description: error.message,
      });
    },
    onSettled: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: waitlistKeys.stats() });
    },
  });
}

/**
 * Hook for fetching waitlist statistics
 * Returns total count, recent signups, and source breakdown
 */
export function useWaitlistStats() {
  const { data, isLoading, error } = useQuery({
    queryKey: waitlistKeys.stats(),
    queryFn: fetchWaitlistStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  return {
    stats: data || {
      total: 0,
      todayCount: 0,
      weekCount: 0,
      monthCount: 0,
      sources: {},
    },
    isLoading,
    error,
  };
}

/**
 * Main waitlist hook that combines all functionality
 * Provides a clean interface for components to use
 */
export function useWaitlist() {
  const addMutation = useAddToWaitlist();
  const removeMutation = useRemoveFromWaitlist();
  const statsQuery = useWaitlistStats();

  return {
    // Actions
    addToWaitlist: addMutation.mutate,
    removeFromWaitlist: removeMutation.mutate,

    // States
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
    isLoadingStats: statsQuery.isLoading,

    // Data
    stats: statsQuery.stats,

    // Errors
    addError: addMutation.error,
    removeError: removeMutation.error,
    statsError: statsQuery.error,

    // Reset functions
    resetAddError: addMutation.reset,
    resetRemoveError: removeMutation.reset,
  };
}
