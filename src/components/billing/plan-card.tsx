"use client";

import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { usePlans } from "@/hooks/use-plans";
import { useAuth } from "@/contexts/auth-context";
import { useSubscription } from "@/hooks/use-subscription";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { CheckCheck, ArrowRight } from "lucide-react";

export default function PlanCard() {
  const {
    subscription,
    hasPremiumSubscription,
    isLoading: authLoading,
  } = useAuth();
  const {
    createCheckout,
    cancelSubscription,
    isLoading: subscriptionLoading,
  } = useSubscription();
  const {
    plans,
    isLoading: plansLoading,
    error: plansError,
    getPremiumPlan,
  } = usePlans();
  const [mounted, setMounted] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoading = authLoading || plansLoading;

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted || isLoading) {
    return (
      <Card className="rounded-2xl p-5 md:p-6 shadow-xl">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold flex items-center gap-1">
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
            </h3>
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="text-right">
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
        </div>
        <div className="flex mt-4">
          <div className="h-11 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </Card>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // Handle plans error
  if (plansError) {
    return (
      <Card className="px-6">
        <div className="text-center py-8">
          <p className="text-destructive">Failed to load plans</p>
        </div>
      </Card>
    );
  }

  // Always show premium plan card
  const premiumPlan = getPremiumPlan();

  // Define features for the premium plan
  const premiumFeatures = [
    "Advance health tracking",
    "Interactive daily journal",
    "Google Calendar Integration",
    "Medication Management",
    "Tips & Trick",
    "Health analytics export",
  ];

  if (!premiumPlan) {
    return (
      <Card className="px-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">No premium plans available</p>
        </div>
      </Card>
    );
  }

  // hasPremiumSubscription is now provided by auth context

  return (
    <Card className="rounded-2xl p-5 md:p-6 shadow-xl">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold flex items-center gap-1">
            Unlock {premiumPlan.name} Features!
            {hasPremiumSubscription ? (
              <span
                className={`ml-2 px-2 py-0.5 text-xs rounded ${getStatusColor(
                  subscription!.status
                )}`}
              >
                {subscription!.status}
              </span>
            ) : (
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                Available
              </span>
            )}
          </h3>
          <div className="text-muted-foreground text-sm mb-7">
            {premiumPlan.description ||
              "Upgrade to premium for advanced features"}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <CheckCheck className="w-5 h-5 text-green-500" />
                </div>
                <span className="text-secondary text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {hasPremiumSubscription && subscription!.cancelAtPeriodEnd && (
            <div className="text-sm text-orange-600">
              ⚠️ Subscription will be canceled at the end of the current period
            </div>
          )}
        </div>
        <div className="text-right hidden md:block">
          <div className="text-2xl font-semibold">
            ${Number(premiumPlan.price).toFixed(2)}
            <span className="font-medium text-base text-muted-foreground">
              /{premiumPlan.interval === "month" ? "mo" : "yr"}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {hasPremiumSubscription
              ? subscription!.cancelAtPeriodEnd
                ? `Ends: ${formatDate(subscription!.currentPeriodEnd)}`
                : `Next billing: ${formatDate(subscription!.currentPeriodEnd)}`
              : `Billed ${premiumPlan.interval}ly`}
          </div>
        </div>
      </div>
      <div className="flex mt-4">
        {hasPremiumSubscription ? (
          // Premium user - show cancel option
          !subscription!.cancelAtPeriodEnd ? (
            <Button
              variant={"outline"}
              size={"sm"}
              className="h-11 text-sm cursor-pointer"
              onClick={() => setShowCancelDialog(true)}
            >
              Cancel Subscription
            </Button>
          ) : (
            <Button
              variant={"outline"}
              size={"sm"}
              className="h-11 text-sm cursor-pointer"
              disabled
            >
              Subscription Canceled
            </Button>
          )
        ) : (
          // Free user - show upgrade option
          <Button
            size={"sm"}
            className="h-11 w-full md:w-40 cursor-pointer"
            disabled={subscriptionLoading}
            onClick={() =>
              createCheckout(
                premiumPlan.id,
                premiumPlan.stripePriceId || premiumPlan.id
              )
            }
          >
            {subscriptionLoading ? (
              "Processing..."
            ) : (
              <span className="flex items-center gap-1">
                <span>Subscribe</span>
                <span className="md:hidden">
                  - ${Number(premiumPlan.price).toFixed(2)}/
                  {premiumPlan.interval === "month" ? "mo" : "yr"}
                </span>
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Cancel Subscription Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You&apos;ll
              continue to have access to premium features until the end of your
              current billing period.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              className="w-full sm:w-auto"
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                cancelSubscription();
                setShowCancelDialog(false);
              }}
              className="w-full sm:w-auto"
            >
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
