"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string;
  stripePriceId: string | null;
  features: any;
}

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/plans", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch plans");
      }

      const data = await response.json();
      if (data.success) {
        setPlans(data.data || []);
      } else {
        throw new Error(data.error || "Failed to fetch plans");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch plans";
      setError(errorMessage);
      console.error("Plans fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getPremiumPlan = () => {
    return plans?.find((plan) => plan.name.toLowerCase() === "premium");
  };

  const getFreePlan = () => {
    return plans?.find((plan) => plan.name.toLowerCase() === "free");
  };

  const refetch = () => {
    fetchPlans();
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    plans,
    isLoading,
    error,
    getPremiumPlan,
    getFreePlan,
    refetch,
  };
}
