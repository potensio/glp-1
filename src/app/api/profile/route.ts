import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
