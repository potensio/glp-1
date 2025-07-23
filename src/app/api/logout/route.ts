import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log("POST /api/logout - Logging out user");

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Clear the auth token cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    console.error("Logout error:", error);
    
    return NextResponse.json(
      {
        error: "Failed to log out",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}