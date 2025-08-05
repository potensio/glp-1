import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  generateToken,
  validateEmail,
  validatePassword,
  generateSecurePassword,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName } = body;

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        {
          success: false,
          error: "Email, first name, and last name are required",
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

    // Auto-generate a secure password
    const generatedPassword = generateSecurePassword();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash the generated password
    const hashedPassword = await hashPassword(generatedPassword);

    // Find the Free plan first
    const freePlan = await prisma.plan.findFirst({
      where: {
        name: "Free",
        isActive: true,
      },
    });

    if (!freePlan) {
      return NextResponse.json(
        { success: false, error: "Free plan not available" },
        { status: 500 }
      );
    }

    // Create user, profile, and free subscription in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user (will be marked as incomplete profile via password generation flag)
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      // Create profile
      const profile = await tx.profile.create({
        data: {
          id: user.id,
          firstName,
          lastName,
        },
      });

      // Create subscription with Free plan
      const subscription = await tx.subscription.create({
        data: {
          userId: user.id,
          planId: freePlan.id,
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          cancelAtPeriodEnd: false,
        },
      });

      return { user, profile, subscription };
    });

    // Generate JWT token
    const token = await generateToken({
      userId: result.user.id,
      email: result.user.email,
    });

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        id: result.user.id,
        email: result.user.email,
      },
      profile: result.profile,
      subscription: {
        id: result.subscription.id,
        planName: "Free",
        status: result.subscription.status,
      },
      generatedPassword, // Return the generated password for auto-login
      token,
    });

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: unknown) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
