import { NextRequest, NextResponse } from "next/server";
import { getUserWithProfileFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Get user with profile in a single optimized query
    const user = await getUserWithProfileFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
      profile: user.profile,
    });
  } catch (error: unknown) {
    console.error("Get current user error:", error);
    
    return NextResponse.json(
      {
        error: "Failed to get user information",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}