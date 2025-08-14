"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { useState } from "react";
import { AuthProvider } from "@/contexts/auth-context";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 60 * 1000, // 30 minutes
            gcTime: 60 * 60 * 1000, // 1 hour
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnMount: false, // Don't refetch on mount if data exists
            placeholderData: (previousData: any) => previousData, // Keep previous data during refetch
            networkMode: 'offlineFirst', // Use cache first for instant navigation
          },
        },
      })
  );

  const [persister] = useState(() => {
    if (typeof window !== 'undefined') {
      return createSyncStoragePersister({
        storage: window.localStorage,
        key: 'glp1-cache',
      });
    }
    return undefined;
  });

  if (persister) {
    return (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          buster: '1.0', // Change this to invalidate all cached data
        }}
      >
        <AuthProvider>{children}</AuthProvider>
      </PersistQueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
