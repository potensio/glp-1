import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { BloodSugarService, bloodSugarSchema } from "@/lib/services/blood-sugar.service";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { level, measurementType, capturedDate } = await request.json();
    
    // Check for missing required fields
    if (typeof level !== 'number' || !measurementType) {
      return NextResponse.json(
        { error: "Missing required fields: level, measurementType" },
        { status: 400 }
      );
    }

    // Create blood sugar entry
    const bloodSugar = await BloodSugarService.createBloodSugar({
      level,
      measurementType,
      profileId: user.id,
      capturedDate: capturedDate ? new Date(capturedDate) : new Date(),
    });

    return NextResponse.json(bloodSugar, { status: 201 });
  } catch (error) {
    console.error("Error creating blood sugar entry:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get("limit") || "10");

    const bloodSugars = startDate && endDate
      ? await BloodSugarService.getBloodSugarsByDateRange(
          user.id,
          new Date(startDate + 'T00:00:00.000Z'),
          new Date(endDate + 'T23:59:59.999Z')
        )
      : await BloodSugarService.getBloodSugarsByProfile(user.id, limit);

    return NextResponse.json(bloodSugars);
  } catch (error) {
    console.error("Error fetching blood sugars:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}