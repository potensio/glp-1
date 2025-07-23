import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  hashPassword,
  generateToken,
  validateEmail,
  validatePassword,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
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
            "Password must be at least 8 characters with uppercase, lowercase, and number",
        },
        { status: 400 }
      );
    }

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

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user and profile in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create user
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

      return { user, profile };
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
