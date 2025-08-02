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
