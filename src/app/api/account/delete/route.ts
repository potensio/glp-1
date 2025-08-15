import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for account deletion
const deleteAccountSchema = z.object({
  reason: z.string().min(1, "Reason is required").max(500, "Reason must be less than 500 characters"),
  confirmEmail: z.string().email("Please enter a valid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = deleteAccountSchema.parse(body);

    // Verify the email matches the user's email
    if (validatedData.confirmEmail !== user.email) {
      return NextResponse.json(
        { error: "Email confirmation does not match your account email" },
        { status: 400 }
      );
    }

    // Log the deletion reason (you might want to store this in a separate table)
    console.log(`Account deletion requested by ${user.email}. Reason: ${validatedData.reason}`);

    // Delete the user account (this will cascade delete all related data)
    await prisma.user.delete({
      where: { id: user.id },
    });

    // Clear the auth cookie
    const response = NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });

    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
    });

    return response;
  } catch (error: unknown) {
    console.error("Delete account error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        error: "Failed to delete account",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}