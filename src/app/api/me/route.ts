import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, getUserWithProfile } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/me - Getting current user");

    // Get user from request (token)
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get full user data with profile
    const user = await getUserWithProfile(authUser.id);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
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