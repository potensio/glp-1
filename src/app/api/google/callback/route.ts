import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // This contains the user ID
    const error = searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      console.error("Google OAuth error:", error);
      return NextResponse.redirect(
        new URL("/home/account?google_error=access_denied", request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/home/account?google_error=invalid_request", request.url)
      );
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      }/api/google/callback`
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error("Failed to get tokens from Google");
    }

    // Set credentials to get user's primary calendar
    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Get user's primary calendar ID
    const calendarList = await calendar.calendarList.list();
    const primaryCalendar = calendarList.data.items?.find(
      (cal) => cal.primary === true
    );

    if (!primaryCalendar?.id) {
      throw new Error("Could not find primary calendar");
    }

    // Save or update Google integration in database
    const userId = state; // state contains the user ID
    const tokenExpiry = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 3600000); // 1 hour default

    await prisma.googleIntegration.upsert({
      where: { userId },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry,
        calendarId: primaryCalendar.id,
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token!,
        tokenExpiry,
        calendarId: primaryCalendar.id,
        isActive: true,
      },
    });

    // Redirect to account page with success message
    return NextResponse.redirect(
      new URL("/home/account?google_connected=true", request.url)
    );
  } catch (error) {
    console.error("Google callback error:", error);
    return NextResponse.redirect(
      new URL("/home/account?google_error=connection_failed", request.url)
    );
  }
}
