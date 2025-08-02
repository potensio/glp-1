import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface GoogleAuthStatus {
  isConnected: boolean;
  isTokenExpired: boolean;
  integration: {
    id: string;
    calendarId: string | null;
    connectedAt: string;
    tokenExpiry: string;
  } | null;
}

interface GoogleAuthResponse {
  success: boolean;
  authUrl?: string;
  error?: string;
}

interface GoogleDisconnectResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Hook for managing Google Calendar authentication
 */
export function useGoogleAuth() {
  const queryClient = useQueryClient();

  // Query to check Google auth status
  const {
    data: authStatus,
    isLoading: isCheckingStatus,
    error: statusError,
    refetch: refetchAuthStatus,
  } = useQuery<GoogleAuthStatus>({
    queryKey: ["google-auth-status"],
    queryFn: async () => {
      const response = await fetch("/api/google/status");
      if (!response.ok) {
        throw new Error("Failed to check Google auth status");
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to check Google auth status");
      }
      return {
        isConnected: data.isConnected,
        isTokenExpired: data.isTokenExpired,
        integration: data.integration,
      };
    },
    staleTime: 0, // Always consider stale to ensure fresh data after OAuth
    retry: 1,
  });

  // Mutation to initiate Google OAuth
  const connectMutation = useMutation<GoogleAuthResponse, Error>({
    mutationFn: async () => {
      const response = await fetch("/api/google/auth");
      if (!response.ok) {
        throw new Error("Failed to initiate Google authentication");
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(
          data.error || "Failed to initiate Google authentication"
        );
      }
      return data;
    },
    onSuccess: (data) => {
      if (data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl;
      }
    },
    onError: (error) => {
      toast.error("Failed to connect to Google Calendar", {
        description: error.message,
      });
    },
  });

  // Mutation to disconnect Google Calendar
  const disconnectMutation = useMutation<GoogleDisconnectResponse, Error>({
    mutationFn: async () => {
      const response = await fetch("/api/google/disconnect", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to disconnect Google Calendar");
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to disconnect Google Calendar");
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success("Google Calendar disconnected", {
        description: data.message,
      });
      // Invalidate auth status and calendar queries
      queryClient.invalidateQueries({ queryKey: ["google-auth-status"] });
      queryClient.invalidateQueries({ queryKey: ["google-calendar-events"] });
    },
    onError: (error) => {
      toast.error("Failed to disconnect Google Calendar", {
        description: error.message,
      });
    },
  });

  return {
    // Status
    authStatus,
    isConnected: authStatus?.isConnected ?? false,
    isTokenExpired: authStatus?.isTokenExpired ?? false,
    integration: authStatus?.integration,
    isCheckingStatus,
    statusError,
    refetchAuthStatus,

    // Actions
    connect: connectMutation.mutate,
    disconnect: disconnectMutation.mutate,
    isConnecting: connectMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,

    // Helpers
    needsReconnection: authStatus?.isConnected && authStatus?.isTokenExpired,
  };
}
