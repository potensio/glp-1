import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { BloodSugarService, bloodSugarSchema } from "@/lib/services/blood-sugar.service";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate input data
    const validatedData = bloodSugarSchema.parse(data);

    // Create blood sugar entry with current date
    const bloodSugar = await BloodSugarService.createBloodSugar({
      ...validatedData,
      profileId: user.id,
      capturedDate: new Date(), // Always use current date
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
          new Date(startDate),
          new Date(endDate)
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