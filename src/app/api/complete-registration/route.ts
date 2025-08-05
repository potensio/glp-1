import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  validateEmail,
  validatePassword,
  getUserFromRequest,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, firstName, lastName, password } = body;

    // Validate required fields
    if (!email || !firstName || !lastName || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email, first name, last name, and password are required",
        },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number",
        },
        { status: 400 }
      );
    }

    // Verify the email matches the authenticated user
    if (email !== user.email) {
      return NextResponse.json(
        { success: false, error: "Email does not match authenticated user" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update user password and profile
      const result = await prisma.$transaction(async (tx) => {
        // Update user password
        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: {
            password: hashedPassword,
          },
        });

        // Update or create profile with completion status
         const updatedProfile = await tx.profile.upsert({
           where: { id: user.id },
           update: {
             firstName,
             lastName,
             isComplete: true,
           },
           create: {
             id: user.id,
             firstName,
             lastName,
             isComplete: true,
           },
           select: {
             id: true,
             firstName: true,
             lastName: true,
             phoneNumber: true,
             isComplete: true,
           },
         });

        return { user: updatedUser, profile: updatedProfile };
      });

    return NextResponse.json({
      success: true,
      message: "Registration completed successfully",
      user: result.user,
      profile: result.profile,
    });
  } catch (error: unknown) {
    console.error("Complete registration error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to complete registration",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}