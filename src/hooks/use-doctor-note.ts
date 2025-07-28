import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface DoctorNote {
  id: string;
  content: string;
  profileId: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateDoctorNoteData {
  content: string;
}

// Fetch doctor note
async function fetchDoctorNote(): Promise<DoctorNote | null> {
  const response = await fetch("/api/doctor-notes", {
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null; // No note exists yet
    }
    throw new Error("Failed to fetch doctor note");
  }

  return response.json();
}

// Save doctor note (create or update)
async function saveDoctorNote(data: CreateDoctorNoteData): Promise<DoctorNote> {
  const response = await fetch("/api/doctor-notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to save doctor note");
  }

  return response.json();
}

export function useDoctorNote() {
  const queryClient = useQueryClient();

  // Query for fetching doctor note
  const {
    data: doctorNote,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["doctor-note"],
    queryFn: fetchDoctorNote,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2, // Only retry twice on failure
    retryDelay: 1000, // Wait 1 second between retries
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  });

  // Mutation for saving doctor note
  const saveMutation = useMutation({
    mutationFn: saveDoctorNote,
    onSuccess: (savedNote) => {
      // Update the cache with the new note
      queryClient.setQueryData(["doctor-note"], savedNote);
      toast.success("Doctor note saved successfully");
    },
    onError: (error) => {
      console.error("Error saving doctor note:", error);
      toast.error("Failed to save doctor note");
    },
  });

  return {
    doctorNote,
    isLoading,
    error,
    saveDoctorNote: saveMutation.mutate,
    isSaving: saveMutation.isPending,
  };
}
