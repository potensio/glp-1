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
import { CheckCheck, Crown, X } from "lucide-react";
import { RegistrationPopup } from "../registration-popup";

interface PaywallCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string; // The feature that triggered the paywall
}

export default function PaywallCard({
  open,
  onOpenChange,
  feature,
}: PaywallCardProps) {
  const {
    subscription,
    hasPremiumSubscription,
    isLoading: authLoading,
    user,
    profile,
  } = useAuth();
  const { createCheckout, isLoading: subscriptionLoading } = useSubscription();
  const {
    plans,
    isLoading: plansLoading,
    error: plansError,
    getPremiumPlan,
  } = usePlans();
  const [mounted, setMounted] = useState(false);
  const [showRegistrationPopup, setShowRegistrationPopup] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubscribeClick = () => {
    if (!premiumPlan) return;

    // Check if profile is incomplete
    if (!profile?.isComplete) {
      setShowRegistrationPopup(true);
      return;
    }

    // Profile is complete, proceed with checkout
    createCheckout(premiumPlan.id, premiumPlan.stripePriceId || premiumPlan.id);
  };

  const handleRegistrationComplete = () => {
    if (!premiumPlan) return;

    // After registration is complete, proceed with checkout
    createCheckout(premiumPlan.id, premiumPlan.stripePriceId || premiumPlan.id);
  };

  const isLoading = authLoading || plansLoading;

  // Don't render if user already has premium
  if (hasPremiumSubscription) {
    return null;
  }

  // Always show premium plan card
  const premiumPlan = getPremiumPlan();

  // Define features for the premium plan
  const premiumFeatures = [
    "Advanced health tracking",
    "Interactive daily journal",
    "Google Calendar Integration",
    "Medication Management",
    "Tips & Tricks",
    "Health analytics export",
  ];

  if (!premiumPlan) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
          {/* Header with close button */}
          <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 p-6 pb-4">
            {/* Crown icon and title */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Unlock Premium Features
                </h2>
                {feature && (
                  <p className="text-sm text-gray-600 mt-1">
                    Access to <span className="font-semibold">{feature}</span>{" "}
                    requires a premium subscription
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 pt-4">
            {/* Pricing */}
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-gray-900">
                ${Number(premiumPlan.price).toFixed(2)}
                <span className="text-lg font-medium text-gray-500 ml-1">
                  /{premiumPlan.interval === "month" ? "month" : "year"}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Billed {premiumPlan.interval}ly • Cancel anytime
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              <div className="space-y-3">
                {premiumFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center gap-3"
                  >
                    <div className="flex-shrink-0">
                      <CheckCheck className="w-5 h-5 text-green-500" />
                    </div>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
                disabled={subscriptionLoading || isLoading}
                onClick={handleSubscribeClick}
              >
                {subscriptionLoading
                  ? "Processing..."
                  : "Start Premium Subscription"}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Secure payment powered by Stripe
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <RegistrationPopup
        open={showRegistrationPopup}
        onOpenChange={setShowRegistrationPopup}
        user={user}
        profile={profile}
        onRegistrationComplete={handleRegistrationComplete}
      />
    </>
  );
}

// Premium Icon Component for menu items
export function PremiumIcon({ className = "w-4 h-4" }: { className?: string }) {
  const { hasPremiumSubscription } = useAuth();

  // Only show crown icon for free users
  if (hasPremiumSubscription) {
    return null;
  }

  return <Crown className={`text-amber-500 ${className}`} />;
}
