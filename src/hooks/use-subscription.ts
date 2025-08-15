"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import StripeClientService from "@/lib/services/stripe-client";
import { useAuth } from "@/contexts/auth-context";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string;
  features: any;
}

interface Subscription {
  id: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  plan: Plan;
}

// Query key factory for potential future use
const QUERY_KEYS = {
  subscription: () => ["subscription"] as const,
} as const;

export function useSubscription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { refreshUser } = useAuth();

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "cancel" }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to cancel subscription");
      }
      return data;
    },
    onSuccess: (data) => {
      // Refresh auth context to update subscription data
      refreshUser();
      toast({
        title: "Subscription Canceled",
        description: data.message || "Your subscription has been canceled.",
      });
    },
    onError: (err) => {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to cancel subscription";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Subscription cancel error:", err);
    },
  });

  // Create checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async ({
      planId,
      priceId,
    }: {
      planId: string;
      priceId: string;
    }) => {
      await StripeClientService.redirectToCheckout({ planId, priceId });
    },
    onSuccess: () => {
      // Refresh auth context when user returns from successful checkout
      // This ensures subscription data is updated immediately
      refreshUser();
    },
    onError: (err) => {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create checkout";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Checkout error:", err);
    },
  });

  const createCheckout = (planId: string, priceId: string) => {
    checkoutMutation.mutate({ planId, priceId });
  };

  const cancelSubscription = () => {
    cancelMutation.mutate();
  };

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subscription() });
  };

  return {
    isLoading: cancelMutation.isPending || checkoutMutation.isPending,
    cancelSubscription,
    createCheckout,
    refetch,
  };
}
