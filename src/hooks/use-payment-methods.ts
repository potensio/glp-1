"use client";

import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface PaymentMethod {
  id: string;
  subscriptionId: string;
  gateway: "STRIPE" | "PAYPAL";
  gatewayId: string;
  gatewaySubId: string | null;
  isDefault: boolean;
  isActive: boolean;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  // UI-friendly fields
  last4?: string;
  exp?: string;
  brand?: string;
}

// Query key factory
const QUERY_KEYS = {
  paymentMethods: (profileId?: string) => ["payment-methods", profileId] as const,
} as const;

// Fetch function
const fetchPaymentMethods = async (profileId: string): Promise<PaymentMethod[]> => {
  const response = await fetch(`/api/payment-methods?profileId=${profileId}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch payment methods");
  }

  const data = await response.json();
  if (data.success) {
    return data.data || [];
  } else {
    throw new Error(data.error || "Failed to fetch payment methods");
  }
};

// Add payment method function
const addPaymentMethod = async (paymentData: {
  gateway: string;
  gatewayId: string;
  isDefault?: boolean;
}): Promise<PaymentMethod> => {
  const response = await fetch("/api/payment-methods", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paymentData),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to add payment method");
  }

  const data = await response.json();
  if (data.success) {
    return data.data;
  } else {
    throw new Error(data.error || "Failed to add payment method");
  }
};

// Delete payment method function
const deletePaymentMethod = async (paymentMethodId: string): Promise<void> => {
  const response = await fetch(`/api/payment-methods/${paymentMethodId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to delete payment method");
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to delete payment method");
  }
};

export function usePaymentMethods(profileId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  if (!profileId) {
    throw new Error('Profile ID is required to fetch payment methods');
  }

  // Query for payment methods data
  const { data } = useSuspenseQuery({
    queryKey: QUERY_KEYS.paymentMethods(profileId),
    queryFn: () => fetchPaymentMethods(profileId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  // Add payment method mutation
  const addMutation = useMutation({
    mutationFn: addPaymentMethod,
    onMutate: async (newPaymentMethod) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.paymentMethods(profileId) });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(QUERY_KEYS.paymentMethods(profileId));

      // Optimistically update
      queryClient.setQueryData(QUERY_KEYS.paymentMethods(profileId), (old: PaymentMethod[] = []) => [
        ...old,
        {
          ...newPaymentMethod,
          id: `temp-${Date.now()}`,
          subscriptionId: '',
          gateway: newPaymentMethod.gateway as "STRIPE" | "PAYPAL",
          gatewaySubId: null,
          isActive: true,
          metadata: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isOptimistic: true,
        } as PaymentMethod & { isOptimistic: boolean },
      ]);

      return { previousData };
    },
    onError: (err, newPaymentMethod, context) => {
      // Rollback on error
      queryClient.setQueryData(QUERY_KEYS.paymentMethods(profileId), context?.previousData);
      const errorMessage = err instanceof Error ? err.message : "Failed to add payment method";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payment method added successfully!",
      });
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.paymentMethods(profileId) });
    },
  });

  // Delete payment method mutation
  const deleteMutation = useMutation({
    mutationFn: deletePaymentMethod,
    onMutate: async (paymentMethodId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.paymentMethods(profileId) });

      const previousData = queryClient.getQueryData(QUERY_KEYS.paymentMethods(profileId));

      // Optimistically remove
      queryClient.setQueryData(QUERY_KEYS.paymentMethods(profileId), (old: PaymentMethod[] = []) =>
        old.filter((method) => method.id !== paymentMethodId)
      );

      return { previousData };
    },
    onError: (err, paymentMethodId, context) => {
      queryClient.setQueryData(QUERY_KEYS.paymentMethods(profileId), context?.previousData);
      const errorMessage = err instanceof Error ? err.message : "Failed to delete payment method";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payment method deleted successfully!",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.paymentMethods(profileId) });
    },
  });

  const addPaymentMethodHandler = (paymentData: {
    gateway: string;
    gatewayId: string;
    isDefault?: boolean;
  }) => {
    addMutation.mutate(paymentData);
  };

  const deletePaymentMethodHandler = (paymentMethodId: string) => {
    deleteMutation.mutate(paymentMethodId);
  };

  return {
    data: data || [],
    addPaymentMethod: addPaymentMethodHandler,
    deletePaymentMethod: deletePaymentMethodHandler,
    isAdding: addMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}