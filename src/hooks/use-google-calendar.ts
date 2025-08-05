import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMemo } from "react";

export interface GoogleCalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  location?: string;
  attendees: string[];
  htmlLink?: string;
}

interface CalendarEventsResponse {
  success: boolean;
  events: GoogleCalendarEvent[];
  nextSyncToken?: string;
  error?: string;
  needsReauth?: boolean;
}

interface SyncResponse {
  success: boolean;
  message: string;
  stats: {
    totalSynced: number;
    created: number;
    updated: number;
    deleted: number;
  };
  error?: string;
  needsReauth?: boolean;
}

interface CreateEventRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  isAllDay?: boolean;
  location?: string;
  attendees?: string[];
  recurrence?: string[];
}

interface CreateEventResponse {
  success: boolean;
  event: GoogleCalendarEvent;
  message: string;
  error?: string;
  needsReauth?: boolean;
}

interface UseGoogleCalendarOptions {
  timeMin?: string;
  timeMax?: string;
  maxResults?: number;
  enabled?: boolean;
}

/**
 * Hook for managing Google Calendar events
 */
export function useGoogleCalendar(options: UseGoogleCalendarOptions = {}) {
  const queryClient = useQueryClient();
  
  // Memoize default date ranges to prevent unnecessary re-renders
  const defaultTimeMin = useMemo(() => new Date().toISOString(), []);
  const defaultTimeMax = useMemo(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), []);
  
  const {
    timeMin = defaultTimeMin,
    timeMax = defaultTimeMax,
    maxResults = 50,
    enabled = true,
  } = options;

  // Query to fetch Google Calendar events
  const {
    data: eventsData,
    isLoading: isLoadingEvents,
    error: eventsError,
    refetch: refetchEvents,
  } = useQuery<GoogleCalendarEvent[]>({
    queryKey: ["google-calendar-events", { timeMin, timeMax, maxResults }],
    queryFn: async () => {
      const params = new URLSearchParams({
        timeMin,
        timeMax,
        maxResults: maxResults.toString(),
      });

      const response = await fetch(`/api/google/calendar/events?${params}`);
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Google Calendar authentication expired");
        }
        throw new Error("Failed to fetch calendar events");
      }

      const data: CalendarEventsResponse = await response.json();
      if (!data.success) {
        if (data.needsReauth) {
          throw new Error("Google Calendar authentication expired");
        }
        throw new Error(data.error || "Failed to fetch calendar events");
      }

      return data.events;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.message.includes("authentication expired")) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Mutation to sync calendar events
  const syncMutation = useMutation<
    SyncResponse,
    Error,
    { timeMin?: string; timeMax?: string }
  >({
    mutationFn: async (syncOptions = {}) => {
      const response = await fetch("/api/google/calendar/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timeMin: syncOptions.timeMin || timeMin,
          timeMax: syncOptions.timeMax || timeMax,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Google Calendar authentication expired");
        }
        throw new Error("Failed to sync calendar events");
      }

      const data: SyncResponse = await response.json();
      if (!data.success) {
        if (data.needsReauth) {
          throw new Error("Google Calendar authentication expired");
        }
        throw new Error(data.error || "Failed to sync calendar events");
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success("Calendar synced successfully", {
        description: `${data.stats.created} created, ${data.stats.updated} updated, ${data.stats.deleted} deleted`,
      });
      // Invalidate calendar events cache to refetch fresh data
      queryClient.invalidateQueries({ 
        queryKey: ["google-calendar-events"],
        exact: false // Invalidate all calendar event queries regardless of time range
      });
    },
    onError: (error) => {
      if (error.message.includes("authentication expired")) {
        toast.error("Google Calendar authentication expired", {
          description: "Please reconnect your Google Calendar",
        });
        // Invalidate auth status to trigger re-check
        queryClient.invalidateQueries({ queryKey: ["google-auth-status"] });
      } else {
        toast.error("Failed to sync calendar", {
          description: error.message,
        });
      }
    },
  });

  // Mutation to create a new calendar event
  const createEventMutation = useMutation<
    CreateEventResponse,
    Error,
    CreateEventRequest,
    { previousEvents: [any, any][] }
  >({
    mutationFn: async (eventData: CreateEventRequest) => {
      const response = await fetch("/api/google/calendar/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Google Calendar authentication expired");
        }
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Invalid event data");
        }
        throw new Error("Failed to create calendar event");
      }

      const data: CreateEventResponse = await response.json();
      if (!data.success) {
        if (data.needsReauth) {
          throw new Error("Google Calendar authentication expired");
        }
        throw new Error(data.error || "Failed to create calendar event");
      }

      return data;
    },
    onMutate: async (newEvent) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["google-calendar-events"] });

      // Snapshot the previous value
      const previousEvents = queryClient.getQueriesData({ queryKey: ["google-calendar-events"] });

      // Optimistically update all relevant calendar queries
      queryClient.setQueriesData(
        { queryKey: ["google-calendar-events"] },
        (old: GoogleCalendarEvent[] | undefined) => {
          if (!old) return [];
          
          const optimisticEvent: GoogleCalendarEvent = {
            id: `temp-${Date.now()}`,
            title: newEvent.title,
            description: newEvent.description,
            startTime: newEvent.startTime,
            endTime: newEvent.endTime,
            isAllDay: newEvent.isAllDay || false,
            location: newEvent.location,
            attendees: newEvent.attendees || [],
          };
          
          return [...old, optimisticEvent];
        }
      );

      return { previousEvents };
    },
    onSuccess: (data) => {
      toast.success("Event created successfully", {
        description: `"${data.event.title}" has been added to your calendar`,
      });
    },
    onError: (error, newEvent, context) => {
        // Rollback optimistic updates on error
        if (context?.previousEvents) {
          context.previousEvents.forEach(([queryKey, data]: [any, any]) => {
            queryClient.setQueryData(queryKey, data);
          });
        }
       
       // Handle specific error types
       if (error.message.includes("authentication expired")) {
         toast.error("Google Calendar authentication expired", {
           description: "Please reconnect your Google Calendar",
         });
         // Invalidate auth status to trigger re-check
         queryClient.invalidateQueries({ queryKey: ["google-auth-status"] });
       } else {
         toast.error("Failed to create event", {
           description: error.message,
         });
       }
     },
    onSettled: () => {
       // Always refetch after mutation to ensure consistency
       queryClient.invalidateQueries({ 
         queryKey: ["google-calendar-events"],
         exact: false
       });
     },
  });

  // Helper function to get events for a specific date range
  const getEventsForDateRange = (startDate: Date, endDate: Date) => {
    if (!eventsData) return [];

    return eventsData.filter((event) => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);

      // Check if event overlaps with the date range
      return eventStart <= endDate && eventEnd >= startDate;
    });
  };

  // Helper function to get events for a specific day
  const getEventsForDay = (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return getEventsForDateRange(startOfDay, endOfDay);
  };

  // Helper function to check if a date has events
  const hasEventsOnDate = (date: Date) => {
    return getEventsForDay(date).length > 0;
  };

  return {
    // Data
    events: eventsData || [],
    isLoadingEvents,
    eventsError,

    // Actions
    refetchEvents,
    syncEvents: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
    createEvent: createEventMutation.mutate,
    isCreatingEvent: createEventMutation.isPending,

    // Helpers
    getEventsForDateRange,
    getEventsForDay,
    hasEventsOnDate,

    // Status
    isAuthError:
      eventsError?.message.includes("authentication expired") ?? false,
  };
}
