import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for profile updates
const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().optional(),
  avatarUrl: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/profile - Starting profile creation");

    // Get authenticated user
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      console.log("No authenticated user found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log("Authenticated user:", { id: authUser.id, email: authUser.email });

    const body = await request.json();
    const { firstName, lastName } = body;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "firstName and lastName are required" },
        { status: 400 }
      );
    }

    // Use upsert to handle race conditions - create if doesn't exist, update if it does
    console.log("Creating/updating profile for user:", authUser.id);

    const profile = await prisma.profile.upsert({
      where: { id: authUser.id },
      update: {
        firstName,
        lastName,
      },
      create: {
        id: authUser.id,
        firstName,
        lastName,
      },
    });

    console.log("Profile created/updated successfully:", profile);

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: unknown) {
    console.error("Profile creation error:", error);
    
    return NextResponse.json(
      {
        error: "Failed to create profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("PUT /api/profile - Starting profile update");
    
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      console.log("No authenticated user found");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    console.log("Updating profile for user:", authUser.id, "with data:", validatedData);

    // Update profile
    const updateData: any = {
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      phoneNumber: validatedData.phoneNumber,
    };
    
    // Only include avatarUrl if it's provided in the request
    if ('avatarUrl' in validatedData) {
      updateData.avatarUrl = validatedData.avatarUrl;
    }
    
    const updatedProfile = await prisma.profile.update({
      where: { id: authUser.id },
      data: updateData,
    });

    console.log("Profile updated successfully:", updatedProfile);

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update profile",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/profile - Starting profile fetch");
    
    // Get authenticated user
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      console.log("No authenticated user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Authenticated user:", { id: authUser.id, email: authUser.email });

    // Get profile from database
    const profile = await prisma.profile.findUnique({
      where: {
        id: authUser.id,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: unknown) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
