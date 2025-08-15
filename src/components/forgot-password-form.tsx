"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }
      
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Forgot your password?</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email and we will send you a reset link
        </p>
      </div>
      {success ? (
        <div className="grid gap-6">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            <p>Reset link sent! Check your email for instructions to reset your password.</p>
          </div>
          <Button 
            size={"lg"} 
            className="w-full cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Return to Login
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              className="h-11 text-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          <Button 
            size={"lg"} 
            className="w-full cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </div>
      )}
      <div className="text-center text-sm">
        Remembered your password?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Login
        </Link>
      </div>
    </form>
  );
}
