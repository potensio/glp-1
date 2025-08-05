import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getUserFromRequest } from "@/lib/auth";

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

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      }/api/google/callback`
    );

    // Generate the URL for Google OAuth consent screen
    const scopes = [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/userinfo.email",
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      state: user.id, // Pass user ID in state for security
      prompt: "consent", // Force consent to get refresh token
    });

    return NextResponse.json({
      success: true,
      authUrl,
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initiate Google authentication" },
      { status: 500 }
    );
  }
}
