import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { BloodPressureService } from "@/lib/services/blood-pressure.service";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Use service layer for business logic
    const bloodPressure = await BloodPressureService.createBloodPressure({
      ...body,
      profileId: user.id,
    });

    return NextResponse.json(bloodPressure, { status: 201 });
  } catch (error) {
    console.error("Error creating blood pressure:", error);

    if (error instanceof Error) {
      if (error.name === "ZodError") {
        return NextResponse.json(
          { error: "Invalid input data", details: error.message },
          { status: 400 }
        );
      }

      if (error.message === "Profile not found") {
        return NextResponse.json(
          { error: "Profile not found" },
          { status: 404 }
        );
      }
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

    // Use service layer for business logic
    const bloodPressures = await BloodPressureService.getBloodPressuresByProfile(
      user.id
    );

    return NextResponse.json(bloodPressures);
  } catch (error) {
    console.error("Error fetching blood pressures:", error);

    if (error instanceof Error && error.message === "Profile not found") {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}