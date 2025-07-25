"use client";

import { Card } from "@/components/ui/card";
import { Button } from "../../../../components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";
import { usePlans } from "@/hooks/use-plans";

export default function PlanCard() {
  const { subscription, isLoading: subscriptionLoading, cancelSubscription, createCheckout } = useSubscription();
  const { plans, isLoading: plansLoading, getPremiumPlan } = usePlans();

  const isLoading = subscriptionLoading || plansLoading;

  if (isLoading) {
    return (
      <Card className="px-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
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
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Always show premium plan card
  const premiumPlan = getPremiumPlan();
  
  if (!premiumPlan) {
    return (
      <Card className="px-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">No premium plans available</p>
        </div>
      </Card>
    );
  }

  // Check if user has premium subscription
  const hasPremiumSubscription = subscription && subscription.plan.name.toLowerCase() !== 'free';

  return (
    <Card className="px-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold flex items-center gap-1">
            {premiumPlan.name}
            {hasPremiumSubscription ? (
              <span className={`ml-2 px-2 py-0.5 text-xs rounded ${getStatusColor(subscription!.status)}`}>
                {subscription!.status}
              </span>
            ) : (
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                Available
              </span>
            )}
          </h3>
          <div className="text-muted-foreground text-sm mb-2">
            {premiumPlan.description || "Upgrade to premium for advanced features"}
          </div>
          {hasPremiumSubscription && subscription!.cancelAtPeriodEnd && (
            <div className="text-sm text-orange-600">
              ⚠️ Subscription will be canceled at the end of the current period
            </div>
          )}
          {!hasPremiumSubscription && (
            <div className="text-sm text-blue-600">
              💡 Unlock advanced features and priority support
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold">
            ${Number(premiumPlan.price).toFixed(2)}
            <span className="font-medium text-base text-muted-foreground">
              /{premiumPlan.interval === 'month' ? 'mo' : 'yr'}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {hasPremiumSubscription ? (
              subscription!.cancelAtPeriodEnd 
                ? `Ends: ${formatDate(subscription!.currentPeriodEnd)}`
                : `Next billing: ${formatDate(subscription!.currentPeriodEnd)}`
            ) : (
              `Billed ${premiumPlan.interval}ly`
            )}
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
              onClick={cancelSubscription}
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
            className="h-11 text-sm cursor-pointer"
            onClick={() => createCheckout(premiumPlan.id, premiumPlan.stripePriceId || premiumPlan.id)}
          >
            Upgrade to {premiumPlan.name}
          </Button>
        )}
      </div>
    </Card>
  );
}
