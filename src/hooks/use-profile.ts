import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { z } from "zod";

// Profile update schema
export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().optional(),
  avatarUrl: z.string().nullable().optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: async (data: ProfileUpdateInput) => {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      return result;
    },
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["auth", "me"] });
      await queryClient.cancelQueries({ queryKey: ["profile"] });

      // Snapshot previous values
      const previousAuthData = queryClient.getQueryData(["auth", "me"]);
      const previousProfileData = queryClient.getQueryData(["profile"]);

      // Optimistically update auth data
      queryClient.setQueryData(["auth", "me"], (old: any) => {
        if (old?.profile) {
          return {
            ...old,
            profile: {
              ...old.profile,
              ...newData,
            },
          };
        }
        return old;
      });

      // Optimistically update profile data if it exists
      queryClient.setQueryData(["profile"], (old: any) => {
        if (old) {
          return {
            ...old,
            ...newData,
          };
        }
        return old;
      });

      return { previousAuthData, previousProfileData };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      if (context?.previousAuthData) {
        queryClient.setQueryData(["auth", "me"], context.previousAuthData);
      }
      if (context?.previousProfileData) {
        queryClient.setQueryData(["profile"], context.previousProfileData);
      }
      toast.error("Failed to update profile");
    },
    onSuccess: (data) => {
      toast.success("Profile updated successfully!");
      
      // Update cache with server response
      queryClient.setQueryData(["auth", "me"], (old: any) => {
        if (old?.profile && data?.profile) {
          return {
            ...old,
            profile: data.profile,
          };
        }
        return old;
      });
      
      // Refresh user data to ensure consistency
      refreshUser();
    },
    onSettled: () => {
      // Always refetch after mutation to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}