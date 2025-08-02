import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Delete Google integration and all associated calendar events
    await prisma.googleIntegration.delete({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      message: "Google Calendar disconnected successfully",
    });
  } catch (error) {
    console.error("Google disconnect error:", error);

    // If integration doesn't exist, still return success
    if (
      error instanceof Error &&
      error.message.includes("Record to delete does not exist")
    ) {
      return NextResponse.json({
        success: true,
        message: "Google Calendar was already disconnected",
      });
    }

    return NextResponse.json(
      { success: false, error: "Failed to disconnect Google Calendar" },
      { status: 500 }
    );
  }
}
