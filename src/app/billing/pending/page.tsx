"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type PendingState = "checking" | "success" | "timeout" | "error";

export default function PendingPage() {
  const { refreshUser, hasPremiumSubscription } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<PendingState>("checking");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [dots, setDots] = useState("");

  // Animated dots for loading state
  useEffect(() => {
    if (state !== "checking") return;

    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, [state]);

  // Countdown timer
  useEffect(() => {
    if (state !== "checking") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setState("timeout");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state]);

  // Check subscription status periodically
  useEffect(() => {
    if (state !== "checking") return;

    const checkSubscription = async () => {
      try {
        await refreshUser();

        // Check if user now has premium subscription
        if (hasPremiumSubscription) {
          setState("success");
          toast.success("Subscription activated!", {
            description: "Your premium subscription is now active.",
          });

          // Redirect after a short delay to show success state
          setTimeout(() => {
            router.push("/home/billing?success=true");
          }, 2000);
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
        // Don't set error state immediately, keep trying
      }
    };

    // Check immediately
    checkSubscription();

    // Then check every 3 seconds
    const interval = setInterval(checkSubscription, 3000);

    return () => clearInterval(interval);
  }, [state, refreshUser, hasPremiumSubscription, router]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleReturnToBilling = () => {
    router.push("/home/billing");
  };

  const handleTryAgain = () => {
    setState("checking");
    setTimeLeft(300);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md p-8 text-center">
        {state === "checking" && (
          <>
            <Image
              src="/illustration/waiting.svg"
              alt="waiting"
              width={400}
              height={300}
              className="aspect-[4/3] rounded-lg object-cover mb-2"
            />
            <div>
              <h1 className="text-2xl font-semibold mb-2">
                Processing Your Subscription{dots}
              </h1>
              <p className="text-muted-foreground">
                We&apos;re confirming your payment with Stripe. This usually takes
                just a few seconds.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-blue-700">
                Time remaining:{" "}
                <span className="font-mono font-semibold">
                  {formatTime(timeLeft)}
                </span>
              </p>

              <Button
                variant="outline"
                onClick={handleReturnToBilling}
                className="w-full"
              >
                Return to Billing
              </Button>
            </div>
          </>
        )}

        {state === "success" && (
          <>
            <Image
              src="/illustration/thumbs-up.svg"
              alt="success"
              width={400}
              height={300}
              className="aspect-[4/3] rounded-lg object-cover mb-2"
            />
            <div>
              <h1 className="text-2xl font-semibold mb-2">
                Subscription Activated!
              </h1>
              <p className="text-muted-foreground">
                Your premium subscription is now active. Redirecting you back to
                billing...
              </p>
            </div>

            <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full mx-auto" />
          </>
        )}

        {state === "timeout" && (
          <>
            <div className="mb-6">
              <AlertCircle className="w-16 h-16 mx-auto text-orange-500" />
            </div>
            <h1 className="text-2xl font-semibold mb-4 text-orange-700">
              Taking Longer Than Expected
            </h1>
            <p className="text-muted-foreground mb-6">
              Your payment is still being processed. You can check back later or
              contact support if you continue to experience issues.
            </p>
            <div className="space-y-3">
              <Button onClick={handleTryAgain} className="w-full">
                Check Again
              </Button>
              <Button
                variant="outline"
                onClick={handleReturnToBilling}
                className="w-full"
              >
                Return to Billing
              </Button>
            </div>
          </>
        )}

        {state === "error" && (
          <>
            <div className="mb-6">
              <AlertCircle className="w-16 h-16 mx-auto text-red-500" />
            </div>
            <h1 className="text-2xl font-semibold mb-4 text-red-700">
              Something Went Wrong
            </h1>
            <p className="text-muted-foreground mb-6">
              We encountered an error while checking your subscription status.
              Please try again or contact support.
            </p>
            <div className="space-y-3">
              <Button onClick={handleTryAgain} className="w-full">
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={handleReturnToBilling}
                className="w-full"
              >
                Return to Billing
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
