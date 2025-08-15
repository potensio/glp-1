"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

export function SecurityPrivacy() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleChangePassword = async () => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "Unable to find user email",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send password reset email");
      }

      toast({
        title: "Password Reset Email Sent",
        description:
          "Check your email for instructions to reset your password.",
      });

      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security & Privacy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Password</h4>
            <p className="text-sm text-muted-foreground">
              Keep your account secure with a strong password
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Change Password
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>
                  We&apos;ll send a password reset link to your email address.
                  You can use this link to set a new password.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button onClick={handleChangePassword} disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {/* 
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Two-Factor Authentication</h4>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security
            </p>
          </div>
          <Button variant="outline" size="sm">
            Enable 2FA
          </Button>
        </div> */}

        {/* <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Login Activity</h4>
            <p className="text-sm text-muted-foreground">
              View recent login sessions
            </p>
          </div>
          <Button variant="outline" size="sm">
            View Activity
          </Button>
        </div> */}
      </CardContent>
    </Card>
  );
}
