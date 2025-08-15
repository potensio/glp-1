"use client";

import PlanCard from "@/components/billing/plan-card";
import PaymentMethods from "@/components/billing/payment-methods";
import BillingHistory from "@/components/billing/billing-history";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { useBillingHistory } from "@/hooks/use-billing-history";
import { useAuth } from "@/contexts/auth-context";
import { Suspense } from "react";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { deduplicatedToast } from "@/lib/utils";

// Component-specific types to match existing component interfaces
type ComponentPaymentMethod = {
  id: number;
  last4: string;
  exp: string;
  default: boolean;
};

type ComponentBillingHistoryItem = {
  id: number;
  plan: string;
  date: string;
  amount: number;
  status: string;
};

// Skeleton components for loading states
function PaymentMethodsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
      <div className="space-y-3">
        <div className="h-16 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-16 w-full bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

function BillingHistorySkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
      <div className="space-y-3">
        <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

// Payment Methods Section Component
function PaymentMethodsSection({ profileId }: { profileId: string }) {
  const { data: paymentMethods } = usePaymentMethods(profileId);

  // Transform data to match existing component props
  const transformedPaymentMethods: ComponentPaymentMethod[] =
    paymentMethods?.length > 0
      ? paymentMethods.map((method, index) => ({
          id: parseInt(method.id) || index + 1,
          last4: method.last4 || "****",
          exp: method.exp || "**/**",
          default: method.isDefault,
        }))
      : [];

  return <PaymentMethods methods={transformedPaymentMethods} />;
}

// Billing History Section Component
function BillingHistorySection({ profileId }: { profileId: string }) {
  const { data: billingHistory } = useBillingHistory(profileId);

  const transformedBillingHistory: ComponentBillingHistoryItem[] =
    billingHistory?.length > 0
      ? billingHistory.map((item, index) => ({
          id: parseInt(item.id) || index + 1,
          plan: item.description || "Plan",
          date: item.date || new Date(item.createdAt).toLocaleDateString(),
          amount: item.amount / 100, // Convert from cents
          status: item.status === "COMPLETED" ? "Paid" : item.status,
        }))
      : [
          {
            id: 1,
            plan: "Pro Plan",
            date: "2024-01-15",
            amount: 29.99,
            status: "Paid",
          },
          {
            id: 2,
            plan: "Pro Plan",
            date: "2023-12-15",
            amount: 29.99,
            status: "Paid",
          },
          {
            id: 3,
            plan: "Basic Plan",
            date: "2023-11-15",
            amount: 9.99,
            status: "Paid",
          },
        ];

  return <BillingHistory history={transformedBillingHistory} />;
}

function BillingPageContent() {
  const { profile } = useAuth();
  const searchParams = useSearchParams();

  // Handle successful return from Stripe checkout - now handled by direct redirect to pending page
  // Check if we're coming from a successful subscription activation
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      // Show success toast and remove the query parameter
      deduplicatedToast(toast.success, "Subscription activated!", {
        description: "Your premium subscription is now active.",
      });

      // Remove the success parameter from URL without triggering a navigation
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  if (!profile?.id) {
    return (
      <>
        <div className="space-y-2">
          <h1 className="text-background text-3xl leading-tight font-semibold">
            Billing & Subscription
          </h1>
          <p className="text-background text-lg mb-6">
            Manage your subscription, payment methods, and billing history
          </p>
        </div>
        <div className="flex flex-col gap-10">
          <PlanCard />
          <PaymentMethodsSkeleton />
          <BillingHistorySkeleton />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <h1 className="text-background text-3xl leading-tight font-semibold">
          Billing & Subscription
        </h1>
        <p className="text-background text-lg mb-6">
          Manage your subscription, payment methods, and billing history
        </p>
      </div>

      <div className="flex flex-col gap-10">
        <PlanCard />
        {/* <div className="grid gap-6 md:grid-cols-2">
          <BillingInfo info={billingInfo} />
        </div> */}
        <Suspense fallback={<PaymentMethodsSkeleton />}>
          <PaymentMethodsSection profileId={profile.id} />
        </Suspense>
        {/* <Suspense fallback={<BillingHistorySkeleton />}>
          <BillingHistorySection profileId={profile.id} />
        </Suspense> */}
      </div>
    </>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BillingPageContent />
    </Suspense>
  );
}
