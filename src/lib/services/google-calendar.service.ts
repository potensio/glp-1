import { google } from "googleapis";
import { googleAuthService } from "./google-auth.service";
import { prisma } from "@/lib/prisma";

export interface CalendarEvent {
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

export interface SyncStats {
  totalSynced: number;
  created: number;
  updated: number;
  deleted: number;
}

export class GoogleCalendarService {
  /**
   * Fetch events from Google Calendar
   */
  async fetchEvents(
    userId: string,
    options: {
      timeMin?: string;
      timeMax?: string;
      maxResults?: number;
    } = {}
  ): Promise<CalendarEvent[]> {
    const auth = await googleAuthService.getAuthenticatedClient(userId);
    const calendar = google.calendar({ version: "v3", auth });

    const integration = await prisma.googleIntegration.findUnique({
      where: { userId },
    });

    if (!integration) {
      throw new Error("Google Calendar integration not found");
    }

    const {
      timeMin = new Date().toISOString(),
      timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxResults = 50,
    } = options;

    const response = await calendar.events.list({
      calendarId: integration.calendarId || "primary",
      timeMin,
      timeMax,
      maxResults,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];

    return events.map((event) => ({
      id: event.id!,
      title: event.summary || "Untitled Event",
      description: event.description || undefined,
      startTime: event.start?.dateTime || event.start?.date || "",
      endTime: event.end?.dateTime || event.end?.date || "",
      isAllDay: !event.start?.dateTime,
      location: event.location || undefined,
      attendees:
        event.attendees
          ?.map((a) => a.email)
          .filter((email): email is string => Boolean(email)) || [],
      htmlLink: event.htmlLink || undefined,
    }));
  }

  /**
   * Sync Google Calendar events to local database
   */
  async syncEvents(
    userId: string,
    options: {
      timeMin?: string;
      timeMax?: string;
    } = {}
  ): Promise<SyncStats> {
    const auth = await googleAuthService.getAuthenticatedClient(userId);
    const calendar = google.calendar({ version: "v3", auth });

    const integration = await prisma.googleIntegration.findUnique({
      where: { userId },
    });

    if (!integration) {
      throw new Error("Google Calendar integration not found");
    }

    const {
      timeMin = new Date().toISOString(),
      timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    } = options;

    const response = await calendar.events.list({
      calendarId: integration.calendarId || "primary",
      timeMin,
      timeMax,
      maxResults: 250,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];
    let syncedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;

    // Track existing events before sync
    const existingEvents = await prisma.calendarEvent.findMany({
      where: {
        googleIntegrationId: integration.id,
        startTime: {
          gte: new Date(timeMin),
          lte: new Date(timeMax),
        },
      },
      select: { googleEventId: true },
    });

    const existingEventIds = new Set(
      existingEvents.map((e) => e.googleEventId)
    );

    // Sync events to database
    for (const event of events) {
      if (!event.id || !event.start || !event.end) continue;

      const eventData = {
        googleEventId: event.id,
        title: event.summary || "Untitled Event",
        description: event.description || null,
        startTime: new Date(event.start.dateTime || event.start.date || ""),
        endTime: new Date(event.end.dateTime || event.end.date || ""),
        isAllDay: !event.start.dateTime,
        location: event.location || null,
        attendees:
          event.attendees
            ?.map((a) => a.email)
            .filter((email): email is string => Boolean(email)) || [],
        updatedAt: new Date(),
      };

      try {
        const wasExisting = existingEventIds.has(event.id);

        await prisma.calendarEvent.upsert({
          where: { googleEventId: event.id },
          update: eventData,
          create: {
            ...eventData,
            googleIntegrationId: integration.id,
          },
        });

        syncedCount++;
        if (wasExisting) {
          updatedCount++;
        } else {
          createdCount++;
        }
      } catch (error) {
        console.error(`Failed to sync event ${event.id}:`, error);
      }
    }

    // Clean up deleted events
    const googleEventIds = events.map((e) => e.id).filter(Boolean) as string[];
    const deletedResult = await prisma.calendarEvent.deleteMany({
      where: {
        googleIntegrationId: integration.id,
        googleEventId: {
          notIn: googleEventIds,
        },
        startTime: {
          gte: new Date(timeMin),
          lte: new Date(timeMax),
        },
      },
    });

    return {
      totalSynced: syncedCount,
      created: createdCount,
      updated: updatedCount,
      deleted: deletedResult.count,
    };
  }

  /**
   * Create a new event in Google Calendar
   */
  async createEvent(
    userId: string,
    eventData: {
      title: string;
      description?: string;
      startTime: string;
      endTime: string;
      isAllDay?: boolean;
      location?: string;
      attendees?: string[];
      recurrence?: string[];
    }
  ): Promise<CalendarEvent> {
    const auth = await googleAuthService.getAuthenticatedClient(userId);
    const calendar = google.calendar({ version: "v3", auth });

    const integration = await prisma.googleIntegration.findUnique({
      where: { userId },
    });

    if (!integration) {
      throw new Error("Google Calendar integration not found");
    }

    const { title, description, startTime, endTime, isAllDay, location, attendees, recurrence } = eventData;

    // Prepare event data for Google Calendar
    const googleEventData: any = {
      summary: title,
      description: description || undefined,
      location: location || undefined,
    };

    // Handle date/time formatting
    if (isAllDay) {
      // For all-day events, use date format (YYYY-MM-DD)
      const startDate = new Date(startTime).toISOString().split('T')[0];
      const endDate = new Date(endTime).toISOString().split('T')[0];
      googleEventData.start = { date: startDate };
      googleEventData.end = { date: endDate };
    } else {
      // For timed events, use dateTime format
      googleEventData.start = { dateTime: startTime };
      googleEventData.end = { dateTime: endTime };
    }

    // Add attendees if provided
    if (attendees && attendees.length > 0) {
      googleEventData.attendees = attendees.map(email => ({ email }));
    }

    // Add recurrence if provided
    if (recurrence && recurrence.length > 0) {
      googleEventData.recurrence = recurrence;
    }

    // Create event in Google Calendar
    const response = await calendar.events.insert({
      calendarId: integration.calendarId || "primary",
      requestBody: googleEventData,
    });

    const createdEvent = response.data;

    // Transform the created event to our format
    return {
      id: createdEvent.id!,
      title: createdEvent.summary || "Untitled Event",
      description: createdEvent.description || undefined,
      startTime: createdEvent.start?.dateTime || createdEvent.start?.date || "",
      endTime: createdEvent.end?.dateTime || createdEvent.end?.date || "",
      isAllDay: !createdEvent.start?.dateTime,
      location: createdEvent.location || undefined,
      attendees: createdEvent.attendees?.map(a => a.email).filter((email): email is string => Boolean(email)) || [],
      htmlLink: createdEvent.htmlLink || undefined,
    };
  }

  /**
   * Get cached events from local database
   */
  async getCachedEvents(
    userId: string,
    options: {
      timeMin?: Date;
      timeMax?: Date;
    } = {}
  ): Promise<CalendarEvent[]> {
    const integration = await prisma.googleIntegration.findUnique({
      where: { userId },
    });

    if (!integration) {
      return [];
    }

    const {
      timeMin = new Date(),
      timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    } = options;

    const events = await prisma.calendarEvent.findMany({
      where: {
        googleIntegrationId: integration.id,
        startTime: {
          gte: timeMin,
          lte: timeMax,
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return events.map((event) => ({
      id: event.googleEventId,
      title: event.title,
      description: event.description || undefined,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      isAllDay: event.isAllDay,
      location: event.location || undefined,
      attendees: event.attendees,
    }));
  }

  /**
   * Check if user has Google Calendar connected
   */
  async isConnected(userId: string): Promise<boolean> {
    const integration = await prisma.googleIntegration.findUnique({
      where: { userId },
      select: { isActive: true, tokenExpiry: true },
    });

    if (!integration || !integration.isActive) {
      return false;
    }

    // Check if token is not expired
    return new Date() <= integration.tokenExpiry;
  }
}

export const googleCalendarService = new GoogleCalendarService();
