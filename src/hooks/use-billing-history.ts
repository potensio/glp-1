"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

interface BillingHistoryItem {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  gateway: "STRIPE" | "PAYPAL";
  gatewayId: string;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  // UI-friendly fields
  date?: string;
  description?: string;
  invoice?: string;
}

// Query key factory
const QUERY_KEYS = {
  billingHistory: (profileId?: string) => ["billing-history", profileId] as const,
} as const;

// Fetch function
const fetchBillingHistory = async (profileId: string): Promise<BillingHistoryItem[]> => {
  const response = await fetch(`/api/billing-history?profileId=${profileId}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch billing history");
  }

  const data = await response.json();
  if (data.success) {
    return data.data || [];
  } else {
    throw new Error(data.error || "Failed to fetch billing history");
  }
};

export function useBillingHistory(profileId?: string) {
  // Query for billing history data
  const { data } = useSuspenseQuery({
    queryKey: QUERY_KEYS.billingHistory(profileId),
    queryFn: () => fetchBillingHistory(profileId!),

    staleTime: 2 * 60 * 1000, // 2 minutes (billing data should be relatively fresh)
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  if (!profileId) {
    throw new Error('Profile ID is required to fetch billing history');
  }

  return {
    data: data || [],
  };
}