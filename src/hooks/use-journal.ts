import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Journal {
  id: string;
  title?: string;
  content: string;
  capturedDate: string;
  profileId: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateJournalData {
  title?: string;
  content: string;
  capturedDate: Date;
}

// Fetch functions
async function fetchJournals(): Promise<Journal[]> {
  const response = await fetch("/api/journals");
  if (!response.ok) {
    throw new Error("Failed to fetch journals");
  }
  return response.json();
}

async function createJournalEntry(data: CreateJournalData): Promise<Journal> {
  const response = await fetch("/api/journals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error("Failed to create journal entry");
  }
  
  return response.json();
}

async function updateJournalEntry(id: string, data: Partial<CreateJournalData>): Promise<Journal> {
  const response = await fetch(`/api/journals/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error("Failed to update journal entry");
  }
  
  return response.json();
}

async function deleteJournalEntry(id: string): Promise<void> {
  const response = await fetch(`/api/journals/${id}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    throw new Error("Failed to delete journal entry");
  }
}

// Query key
const QUERY_KEYS = {
  journals: () => ["journals"] as const,
} as const;

// Hook for fetching journals
export function useJournals() {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.journals(),
    queryFn: fetchJournals,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    data: data || [],
    isLoading,
    error,
    // Computed values
    latest: data?.[0] || null,
    count: data?.length || 0,
  };
}

// Hook for creating journal entries
export function useCreateJournal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createJournalEntry,
    onMutate: async (newJournal) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.journals() });

      // Snapshot previous value
      const previousJournals = queryClient.getQueryData(QUERY_KEYS.journals());

      // Optimistically update
      queryClient.setQueryData(QUERY_KEYS.journals(), (old: Journal[]) => [
        {
          ...newJournal,
          id: `temp-${Date.now()}`,
          capturedDate: newJournal.capturedDate.toISOString(),
          profileId: "temp",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isOptimistic: true,
        } as Journal & { isOptimistic: boolean },
        ...(old || []),
      ]);

      return { previousJournals };
    },
    onError: (err, newJournal, context) => {
      // Rollback on error
      queryClient.setQueryData(QUERY_KEYS.journals(), context?.previousJournals);
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.journals() });
    },
  });
}

// Hook for updating journal entries
export function useUpdateJournal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateJournalData> }) => 
      updateJournalEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.journals() });
    },
  });
}

// Hook for deleting journal entries
export function useDeleteJournal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteJournalEntry,
    onMutate: async (deletedId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.journals() });

      // Snapshot previous value
      const previousJournals = queryClient.getQueryData(QUERY_KEYS.journals());

      // Optimistically remove the journal
      queryClient.setQueryData(QUERY_KEYS.journals(), (old: Journal[]) => 
        (old || []).filter(journal => journal.id !== deletedId)
      );

      return { previousJournals };
    },
    onError: (err, deletedId, context) => {
      // Rollback on error
      queryClient.setQueryData(QUERY_KEYS.journals(), context?.previousJournals);
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.journals() });
    },
  });
}