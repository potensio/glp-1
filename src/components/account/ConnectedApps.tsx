"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useGoogleAuth } from "@/hooks/use-google-auth";
import { useGoogleCalendar } from "@/hooks/use-google-calendar";
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function ConnectedApps() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const {
    authStatus,
    isConnected,
    isTokenExpired,
    integration,
    isCheckingStatus,
    connect,
    disconnect,
    isConnecting,
    isDisconnecting,
    needsReconnection,
    refetchAuthStatus,
  } = useGoogleAuth();

  const { syncEvents, isSyncing } = useGoogleCalendar({ enabled: isConnected });

  // Handle OAuth callback results
  useEffect(() => {
    const googleConnected = searchParams.get("google_connected");
    const googleError = searchParams.get("google_error");

    if (googleConnected === "true") {
      // Force immediate refetch of auth status
      refetchAuthStatus();

      // Trigger initial calendar sync after successful connection
      setTimeout(() => {
        syncEvents({});
      }, 1000); // Small delay to ensure auth status is updated

      toast.success("Google Calendar connected successfully!", {
        description: "Your calendar events are being synced.",
      });

      // Clean up URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete("google_connected");
      window.history.replaceState({}, "", url.toString());
    }

    if (googleError) {
      let errorMessage = "Failed to connect Google Calendar";
      let errorDescription = "Please try again.";

      switch (googleError) {
        case "access_denied":
          errorMessage = "Access denied";
          errorDescription =
            "You need to grant permission to connect Google Calendar.";
          break;
        case "invalid_request":
          errorMessage = "Invalid request";
          errorDescription =
            "There was an issue with the authentication request.";
          break;
        case "connection_failed":
          errorMessage = "Connection failed";
          errorDescription =
            "Unable to establish connection with Google Calendar.";
          break;
      }

      toast.error(errorMessage, {
        description: errorDescription,
      });

      // Clean up URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete("google_error");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, queryClient]);

  const handleConnect = () => {
    connect();
  };

  const handleDisconnect = () => {
    if (
      window.confirm(
        "Are you sure you want to disconnect Google Calendar? This will remove all synced events."
      )
    ) {
      disconnect();
    }
  };

  const getConnectionStatus = () => {
    if (isCheckingStatus) {
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        text: "Checking...",
        variant: "secondary" as const,
      };
    }

    if (!isConnected) {
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        text: "Not Connected",
        variant: "destructive" as const,
      };
    }

    if (needsReconnection) {
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        text: "Needs Reconnection",
        variant: "destructive" as const,
      };
    }

    return {
      icon: <CheckCircle className="h-4 w-4" />,
      text: "Connected",
      variant: "default" as const,
    };
  };

  const status = getConnectionStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Connected Apps
        </CardTitle>
        <CardDescription>
          Manage your connected applications and integrations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Google Calendar Integration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium">Google Calendar</h3>
                <p className="text-sm text-muted-foreground">
                  Sync your calendar events to view them in your dashboard
                </p>
              </div>
            </div>
            <Badge variant={status.variant} className="flex items-center gap-1">
              {status.icon}
              {status.text}
            </Badge>
          </div>

          {/* Connection Details */}
          {isConnected && integration && (
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Connected:</span>
                <span>
                  {format(
                    new Date(integration.connectedAt),
                    "MMM d, yyyy 'at' h:mm a"
                  )}
                </span>
              </div>
              {integration.calendarId && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Calendar ID:</span>
                  <span className="font-mono text-xs">
                    {integration.calendarId}
                  </span>
                </div>
              )}
              {isTokenExpired && (
                <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  <span>Token expired - reconnection required</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!isConnected || needsReconnection ? (
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex items-center gap-2"
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                {needsReconnection ? "Reconnect" : "Connect"} Google Calendar
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="flex items-center gap-2"
              >
                {isDisconnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                Disconnect
              </Button>
            )}
          </div>

          {/* Help Text */}
          <div className="text-sm text-muted-foreground">
            {!isConnected ? (
              <p>
                Connect your Google Calendar to automatically sync your events
                and view them alongside your health data in the weekly calendar.
              </p>
            ) : (
              <p>
                Your Google Calendar is connected. Events will be automatically
                synced and displayed in your dashboard calendar.
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Future integrations placeholder */}
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            More integrations coming soon...
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
