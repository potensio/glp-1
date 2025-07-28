"use client";

import { useQuery } from "@tanstack/react-query";
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

// Query key factory
const QUERY_KEYS = {
  plans: () => ["plans"] as const,
} as const;

// Fetch function
const fetchPlans = async (): Promise<Plan[]> => {
  const response = await fetch("/api/plans", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch plans");
  }

  const data = await response.json();
  if (data.success) {
    return data.data || [];
  } else {
    throw new Error(data.error || "Failed to fetch plans");
  }
};

export function usePlans() {
  const { toast } = useToast();

  // Query for plans data
  const { data: plans = [], isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.plans(),
    queryFn: fetchPlans,
    staleTime: 10 * 60 * 1000, // 10 minutes (plans don't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });

  const getPremiumPlan = () => {
    return plans?.find((plan: Plan) => plan.name.toLowerCase() === "premium");
  };

  const getFreePlan = () => {
    return plans?.find((plan: Plan) => plan.name.toLowerCase() === "free");
  };

  return {
    plans,
    isLoading,
    error,
    getPremiumPlan,
    getFreePlan,
    refetch,
  };
}
