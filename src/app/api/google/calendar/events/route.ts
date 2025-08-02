import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { googleAuthService } from "@/lib/services/google-auth.service";

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