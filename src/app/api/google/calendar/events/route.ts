import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { googleAuthService } from "@/lib/services/google-auth.service";

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

export async function GET(request: NextRequest) {
  try {
    // Get user from request
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get authenticated Google client (handles token refresh automatically)
    let oauth2Client;
    let googleIntegration;
    
    try {
      oauth2Client = await googleAuthService.getAuthenticatedClient(user.id);
      
      // Get integration details for calendar ID
      googleIntegration = await prisma.googleIntegration.findUnique({
        where: { userId: user.id },
        select: { calendarId: true },
      });
      
      if (!googleIntegration) {
        return NextResponse.json(
          { success: false, error: "Google Calendar integration not found", needsReauth: true },
          { status: 401 }
        );
      }
    } catch (error: any) {
      if (error.message.includes("not connected") || error.message.includes("reconnect")) {
        return NextResponse.json(
          { success: false, error: error.message, needsReauth: true },
          { status: 401 }
        );
      }
      throw error;
    }

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const timeMin = searchParams.get("timeMin") || new Date().toISOString();
    const timeMax = searchParams.get("timeMax") || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days from now
    const maxResults = parseInt(searchParams.get("maxResults") || "50");

    // Fetch events from Google Calendar
    const response = await calendar.events.list({
      calendarId: googleIntegration.calendarId || "primary",
      timeMin,
      timeMax,
      maxResults,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];

    // Transform events to our format
    const transformedEvents = events.map((event) => ({
      id: event.id,
      title: event.summary || "Untitled Event",
      description: event.description || null,
      startTime: event.start?.dateTime || event.start?.date,
      endTime: event.end?.dateTime || event.end?.date,
      isAllDay: !event.start?.dateTime, // If no dateTime, it's an all-day event
      location: event.location || null,
      attendees: event.attendees?.map(a => a.email).filter(Boolean) || [],
      htmlLink: event.htmlLink,
    }));

    return NextResponse.json({
      success: true,
      events: transformedEvents,
      nextSyncToken: response.data.nextSyncToken,
    });
  } catch (error) {
    console.error("Google calendar events error:", error);
    
    // Handle specific Google API errors
    if (error instanceof Error) {
      if (error.message.includes("invalid_grant") || error.message.includes("Token has been expired")) {
        return NextResponse.json(
          { success: false, error: "Google token expired", needsReauth: true },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from request
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body: CreateEventRequest = await request.json();
    const { title, description, startTime, endTime, isAllDay, location, attendees, recurrence } = body;

    // Validate required fields
    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: "Title, start time, and end time are required" },
        { status: 400 }
      );
    }

    // Get authenticated Google client
    let oauth2Client;
    let googleIntegration;
    
    try {
      oauth2Client = await googleAuthService.getAuthenticatedClient(user.id);
      
      // Get integration details for calendar ID
      googleIntegration = await prisma.googleIntegration.findUnique({
        where: { userId: user.id },
        select: { calendarId: true },
      });
      
      if (!googleIntegration) {
        return NextResponse.json(
          { success: false, error: "Google Calendar integration not found", needsReauth: true },
          { status: 401 }
        );
      }
    } catch (error: any) {
      if (error.message.includes("not connected") || error.message.includes("reconnect")) {
        return NextResponse.json(
          { success: false, error: error.message, needsReauth: true },
          { status: 401 }
        );
      }
      throw error;
    }

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Prepare event data for Google Calendar
    const eventData: any = {
      summary: title,
      description: description || undefined,
      location: location || undefined,
    };

    // Handle date/time formatting
    if (isAllDay) {
      // For all-day events, use date format (YYYY-MM-DD)
      const startDate = new Date(startTime).toISOString().split('T')[0];
      const endDate = new Date(endTime).toISOString().split('T')[0];
      eventData.start = { date: startDate };
      eventData.end = { date: endDate };
    } else {
      // For timed events, use dateTime format with timezone
      // Ensure the datetime strings are properly formatted with timezone
      const startDateTime = new Date(startTime).toISOString();
      const endDateTime = new Date(endTime).toISOString();
      eventData.start = { 
        dateTime: startDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
      eventData.end = { 
        dateTime: endDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
    }

    // Add attendees if provided
    if (attendees && attendees.length > 0) {
      eventData.attendees = attendees.map(email => ({ email }));
    }

    // Add recurrence if provided
    if (recurrence && recurrence.length > 0) {
      eventData.recurrence = recurrence;
    }

    // Create event in Google Calendar
    const response = await calendar.events.insert({
      calendarId: googleIntegration.calendarId || "primary",
      requestBody: eventData,
    });

    const createdEvent = response.data;

    // Transform the created event to our format
    const transformedEvent = {
      id: createdEvent.id,
      title: createdEvent.summary || "Untitled Event",
      description: createdEvent.description || null,
      startTime: createdEvent.start?.dateTime || createdEvent.start?.date,
      endTime: createdEvent.end?.dateTime || createdEvent.end?.date,
      isAllDay: !createdEvent.start?.dateTime,
      location: createdEvent.location || null,
      attendees: createdEvent.attendees?.map(a => a.email).filter(Boolean) || [],
      htmlLink: createdEvent.htmlLink,
    };

    return NextResponse.json({
      success: true,
      event: transformedEvent,
      message: "Event created successfully",
    });
  } catch (error) {
    console.error("Google calendar create event error:", error);
    
    // Handle specific Google API errors
    if (error instanceof Error) {
      if (error.message.includes("invalid_grant") || error.message.includes("Token has been expired")) {
        return NextResponse.json(
          { success: false, error: "Google token expired", needsReauth: true },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Failed to create calendar event" },
      { status: 500 }
    );
  }
}