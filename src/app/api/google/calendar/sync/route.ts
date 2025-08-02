import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { googleAuthService } from "@/lib/services/google-auth.service";

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

    // Get authenticated Google client (handles token refresh automatically)
    let oauth2Client;
    let googleIntegration;
    
    try {
      oauth2Client = await googleAuthService.getAuthenticatedClient(user.id);
      
      // Get integration details
      googleIntegration = await prisma.googleIntegration.findUnique({
        where: { userId: user.id },
        select: { id: true, calendarId: true },
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

    // Get sync parameters from request body
    const body = await request.json().catch(() => ({}));
    const timeMin = body.timeMin || new Date().toISOString();
    const timeMax = body.timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now

    // Fetch events from Google Calendar
    const response = await calendar.events.list({
      calendarId: googleIntegration.calendarId || "primary",
      timeMin,
      timeMax,
      maxResults: 250,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];
    let syncedCount = 0;
    let updatedCount = 0;
    let createdCount = 0;

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
        attendees: event.attendees?.map(a => a.email).filter((email): email is string => typeof email === 'string' && email.length > 0) || [],
        updatedAt: new Date(),
      };

      try {
        const result = await prisma.calendarEvent.upsert({
          where: { googleEventId: event.id },
          update: eventData,
          create: {
            ...eventData,
            googleIntegrationId: googleIntegration.id,
          },
        });

        syncedCount++;
        // Check if this was an update or create based on the result
        // This is a simple heuristic - in practice, you might want to track this more precisely
        if (result.createdAt.getTime() === result.updatedAt.getTime()) {
          createdCount++;
        } else {
          updatedCount++;
        }
      } catch (error) {
        console.error(`Failed to sync event ${event.id}:`, error);
      }
    }

    // Clean up deleted events (events that exist in our DB but not in Google)
    const googleEventIds = events.map(e => e.id).filter((id): id is string => typeof id === 'string' && id.length > 0);
    const deletedResult = await prisma.calendarEvent.deleteMany({
      where: {
        googleIntegrationId: googleIntegration.id,
        googleEventId: {
          notIn: googleEventIds,
        },
        // Only delete events within the sync time range
        startTime: {
          gte: new Date(timeMin),
          lte: new Date(timeMax),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Calendar events synced successfully",
      stats: {
        totalSynced: syncedCount,
        created: createdCount,
        updated: updatedCount,
        deleted: deletedResult.count,
      },
    });
  } catch (error) {
    console.error("Google calendar sync error:", error);
    
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
      { success: false, error: "Failed to sync calendar events" },
      { status: 500 }
    );
  }
}