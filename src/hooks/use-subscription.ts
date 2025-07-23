"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import StripeClientService from "@/lib/services/stripe-client";

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

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/subscription", {
        credentials: "include",
      });

      if (response.status === 404) {
        // No subscription found - user might be on free plan
        setSubscription(null);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch subscription");
      }

      const data = await response.json();
      if (data.success) {
        setSubscription(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch subscription");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch subscription";
      setError(errorMessage);
      console.error("Subscription fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async () => {
    try {
      setIsLoading(true);
      
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
      if (data.success) {
        // Refresh subscription data after cancellation
        await fetchSubscription();
        toast({
          title: "Subscription Canceled",
          description: data.message || "Your subscription has been canceled.",
        });
      } else {
        throw new Error(data.error || "Failed to cancel subscription");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to cancel subscription";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Subscription cancel error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createCheckout = async (planId: string, priceId: string) => {
    try {
      setIsLoading(true);
      await StripeClientService.redirectToCheckout({ planId, priceId });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create checkout";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Checkout error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchSubscription();
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  return {
    subscription,
    isLoading,
    error,
    cancelSubscription,
    createCheckout,
    refetch,
  };
}