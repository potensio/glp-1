"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

const registrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number"),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  profile: any;
  onRegistrationComplete?: () => void;
}

export function RegistrationPopup({
  open,
  onOpenChange,
  user,
  profile,
  onRegistrationComplete,
}: RegistrationPopupProps) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { refreshUser, updateProfileCompletion } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      email: user?.email || "",
    },
  });

  const onSubmit = async (data: RegistrationFormData) => {
    setError("");
    setIsLoading(true);

    try {
      // Update user profile with complete registration
      const response = await fetch("/api/complete-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration completion failed");
      }

      if (!result.success) {
        throw new Error(result.error || "Registration completion failed");
      }

      console.log('Registration completed successfully:', result);
      
      // Immediately update profile completion status in cache
      updateProfileCompletion(true);
      console.log('Profile completion status updated in cache');
      
      // Refresh user context to update profile completion status
      console.log('Calling refreshUser...');
      await refreshUser();
      console.log('refreshUser completed');
      
      // Notify parent component of successful registration
      if (onRegistrationComplete) {
        onRegistrationComplete();
      }
      
      // Close the popup
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("Registration completion error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred during registration completion"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Your Registration</DialogTitle>
          <DialogDescription>
            Please set a password to complete your account setup.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                placeholder="John"
                {...register("firstName")}
                className={`${errors.firstName ? "border-red-500" : ""}`}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                {...register("lastName")}
                className={`${errors.lastName ? "border-red-500" : ""}`}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register("email")}
              className={`${errors.email ? "border-red-500" : ""}`}
              disabled
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register("password")}
              className={`${errors.password ? "border-red-500" : ""}`}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Completing..." : "Complete Registration"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}