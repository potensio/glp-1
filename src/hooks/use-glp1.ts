import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Glp1Input } from "@/lib/services/glp1.service";

interface Glp1Entry {
  id: string;
  type: string;
  dose: number;
  capturedDate: string;
  profileId: string;
  createdAt: string;
  updatedAt: string;
}

export function useGlp1() {
  const [isLoading, setIsLoading] = useState(false);
  const [glp1Entries, setGlp1Entries] = useState<Glp1Entry[]>([]);
  const { toast } = useToast();

  const createGlp1Entry = useCallback(
    async (data: Glp1Input) => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/glp1-entries", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: data.type,
            dose: data.dose,
            ...(data.capturedDate && { capturedDate: data.capturedDate.toISOString() }),
          }),
        });

        if (!response.ok) {
          let errorMessage = "Failed to log GLP-1 entry";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // If response is not JSON, use default message
          }
          throw new Error(errorMessage);
        }

        const newEntry = await response.json();
        
        // Update local state
        setGlp1Entries(prev => [newEntry, ...prev]);
        
        toast({
          title: "GLP-1 entry logged successfully!",
          description: `${data.type} ${data.dose}mg`,
        });

        return newEntry;
      } catch (error) {
        console.error("Error creating GLP-1 entry:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to log GLP-1 entry",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const fetchGlp1Entries = useCallback(
    async (startDate?: Date, endDate?: Date) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate.toISOString());
        if (endDate) params.append("endDate", endDate.toISOString());

        const response = await fetch(`/api/glp1-entries?${params.toString()}`);
        
        if (!response.ok) {
          let errorMessage = "Failed to fetch GLP-1 entries";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // If response is not JSON, use default message
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        setGlp1Entries(data);
        return data;
      } catch (error) {
        console.error("Error fetching GLP-1 entries:", error);
        toast({
          title: "Error",
          description: "Failed to fetch GLP-1 entries",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const deleteGlp1Entry = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/glp1-entries/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          let errorMessage = "Failed to delete GLP-1 entry";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // If response is not JSON, use default message
          }
          throw new Error(errorMessage);
        }

        // Update local state
        setGlp1Entries(prev => prev.filter(entry => entry.id !== id));
        
        toast({
          title: "GLP-1 entry deleted successfully!",
        });
      } catch (error) {
        console.error("Error deleting GLP-1 entry:", error);
        toast({
          title: "Error",
          description: "Failed to delete GLP-1 entry",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  return {
    glp1Entries,
    isLoading,
    createGlp1Entry,
    fetchGlp1Entries,
    deleteGlp1Entry,
  };
}