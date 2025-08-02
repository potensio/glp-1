import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Check if user has Google integration
    const googleIntegration = await prisma.googleIntegration.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        isActive: true,
        calendarId: true,
        createdAt: true,
        tokenExpiry: true,
      },
    });

    const isConnected = googleIntegration?.isActive === true;
    const isTokenExpired = googleIntegration?.tokenExpiry
      ? new Date() > googleIntegration.tokenExpiry
      : false;

    return NextResponse.json({
      success: true,
      isConnected,
      isTokenExpired,
      integration: googleIntegration
        ? {
            id: googleIntegration.id,
            calendarId: googleIntegration.calendarId,
            connectedAt: googleIntegration.createdAt,
            tokenExpiry: googleIntegration.tokenExpiry,
          }
        : null,
    });
  } catch (error) {
    console.error("Google status error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check Google Calendar status" },
      { status: 500 }
    );
  }
}
