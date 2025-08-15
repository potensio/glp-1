import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter } from "next/navigation";

// Account deletion schema
export const deleteAccountSchema = z.object({
  reason: z.string().min(1, "Reason is required").max(500, "Reason must be less than 500 characters"),
  confirmEmail: z.string().email("Please enter a valid email address"),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

// Delete account function
async function deleteAccount(data: DeleteAccountInput) {
  const response = await fetch("/api/account/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete account");
  }

  return response.json();
}



// Hook for deleting account
export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { logout } = useAuth();

  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      toast.success("Account deleted successfully");
      
      // Clear all cached data
      queryClient.clear();
      
      // Log out the user
      logout();
      
      // Redirect to home page
      router.push("/");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete account");
    },
  });
}