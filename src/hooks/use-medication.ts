import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { MedicationInput } from "@/services/medication.service";

// Fetch medication entries from API
async function fetchMedicationEntries() {
  const response = await fetch("/api/medications");

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch medication data");
  }

  return response.json();
}

export function useMedication() {
  const { profile } = useAuth();

  const {
    data: entries = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["medications", profile?.id || "no-profile"],
    queryFn: fetchMedicationEntries,
    enabled: !!profile?.id, // Only run query when profile is available
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const queryClient = useQueryClient();

  const createMedicationMutation = useMutation({
    mutationFn: async (data: MedicationInput) => {
      if (!profile?.id) {
        throw new Error("Profile not found");
      }

      const response = await fetch("/api/medications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          dosage: data.dosage,
          description: data.description,
          prescribingDoctor: data.prescribingDoctor,
          status: data.status,
          startDate: new Date(data.startDate).toISOString(),
          repeatEvery: data.repeatEvery,
          repeatUnit: data.repeatUnit,
          enableReminders: data.enableReminders,
          profileId: profile.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create medication");
      }

      return await response.json();
    },
    onSuccess: (result, data) => {
      toast.success("Medication added successfully!", {
        description: `${data.name} (${data.dosage}) has been added to your medications.`,
      });

      // Invalidate and refetch medication data
      queryClient.invalidateQueries({ queryKey: ["medications"] });
    },
    onError: (error) => {
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to add medication. Please try again.",
      });
    },
  });

  const updateMedicationMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<MedicationInput>;
    }) => {
      const response = await fetch(`/api/medications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update medication");
      }

      return await response.json();
    },
    onSuccess: (result, { data }) => {
      toast.success("Medication updated successfully!", {
        description: `${data.name || "Medication"} has been updated.`,
      });

      // Invalidate and refetch medication data
      queryClient.invalidateQueries({ queryKey: ["medications"] });
    },
    onError: (error) => {
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to update medication. Please try again.",
      });
    },
  });

  const deleteMedicationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/medications/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete medication");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Medication deleted successfully!", {
        description: "The medication has been removed from your list.",
      });

      // Invalidate and refetch medication data
      queryClient.invalidateQueries({ queryKey: ["medications"] });
    },
    onError: (error) => {
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete medication. Please try again.",
      });
    },
  });

  return {
    entries,
    createMedication: createMedicationMutation.mutate,
    updateMedication: updateMedicationMutation.mutate,
    deleteMedication: deleteMedicationMutation.mutate,
    isCreating: createMedicationMutation.isPending,
    isUpdating: updateMedicationMutation.isPending,
    isDeleting: deleteMedicationMutation.isPending,
    isLoading,
    error,
  };
}
