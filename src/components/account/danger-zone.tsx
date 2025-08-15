"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useDeleteAccount,
  deleteAccountSchema,
  type DeleteAccountInput,
} from "@/hooks/use-account";
import { useAuth } from "@/contexts/auth-context";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function DangerZone() {
  const { user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const deleteAccountMutation = useDeleteAccount();

  const deleteForm = useForm<DeleteAccountInput>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      reason: "",
      confirmEmail: "",
    },
  });

  const handleDeleteAccount = (data: DeleteAccountInput) => {
    deleteAccountMutation.mutate(data, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        deleteForm.reset();
      },
    });
  };

  return (
    <>
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Delete Account</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={deleteForm.handleSubmit(handleDeleteAccount)} className="space-y-4">
            <Alert>
              <AlertTriangle className="size-4" />
              <AlertDescription>
                <strong>Warning:</strong> All your health data, journal entries, medications, and account information will be permanently deleted.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="delete-reason">Reason for deletion (required)</Label>
              <Textarea
                id="delete-reason"
                placeholder="Please tell us why you're deleting your account..."
                {...deleteForm.register("reason")}
                className="min-h-[80px]"
              />
              {deleteForm.formState.errors.reason && (
                <p className="text-sm text-destructive">
                  {deleteForm.formState.errors.reason.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-email">Confirm your email address</Label>
              <Input
                id="confirm-email"
                type="email"
                placeholder={user?.email || "Enter your email"}
                {...deleteForm.register("confirmEmail")}
              />
              {deleteForm.formState.errors.confirmEmail && (
                <p className="text-sm text-destructive">
                  {deleteForm.formState.errors.confirmEmail.message}
                </p>
              )}
            </div>
            
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  deleteForm.reset();
                }}
                disabled={deleteAccountMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={deleteAccountMutation.isPending}
              >
                {deleteAccountMutation.isPending && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Delete Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


    </>
  );
}
