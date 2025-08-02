"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useGoogleAuth } from "@/hooks/use-google-auth";
import { toast } from "sonner";

export default function ConnectedApps() {
  const {
    authStatus,
    isConnected,
    isTokenExpired,
    integration,
    connect,
    disconnect,
    isCheckingStatus,
    isConnecting,
    isDisconnecting,
  } = useGoogleAuth();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      toast.error("Failed to connect to Google Calendar");
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success("Google Calendar disconnected successfully");
    } catch (error) {
      toast.error("Failed to disconnect Google Calendar");
    }
  };

  const getStatusBadge = () => {
    if (isCheckingStatus) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Checking...
        </Badge>
      );
    }

    if (!isConnected) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Not Connected
        </Badge>
      );
    }

    if (isTokenExpired) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Token Expired
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="flex items-center gap-1 bg-green-500">
        <CheckCircle className="h-3 w-3" />
        Connected
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Connected Apps
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">Google Calendar</h3>
              <p className="text-sm text-gray-500">
                Sync your calendar events and reminders
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge()}
            {isConnected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
              >
                Disconnect
              </Button>
            ) : (
              <Button size="sm" onClick={handleConnect} disabled={isConnecting}>
                Connect
              </Button>
            )}
          </div>
        </div>

        {isConnected && integration && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Integration Details</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Calendar ID:</span>{" "}
                {integration.calendarId}
              </p>
              <p>
                <span className="font-medium">Connected:</span>{" "}
                {new Date(integration.connectedAt).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">Token Expires:</span>{" "}
                {new Date(integration.tokenExpiry).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <p className="text-sm text-gray-500">
            Connect your Google Calendar to automatically sync events and set
            medication reminders.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
