import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { BloodPressureService } from "@/lib/services/blood-pressure.service";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { systolic, diastolic, capturedDate } = await request.json();

    if (!systolic || typeof systolic !== 'number') {
      return NextResponse.json({ error: 'Systolic pressure is required and must be a number' }, { status: 400 });
    }

    if (!diastolic || typeof diastolic !== 'number') {
      return NextResponse.json({ error: 'Diastolic pressure is required and must be a number' }, { status: 400 });
    }

    // Use current date if capturedDate is not provided
    const dateToCapture = capturedDate ? new Date(capturedDate) : new Date();

    // Use service layer for business logic
    const bloodPressure = await BloodPressureService.createBloodPressure({
      systolic,
      diastolic,
      capturedDate: dateToCapture,
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

    // Get query parameters for date filtering
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let bloodPressures;
    
    if (startDate && endDate) {
      // Use date range filtering if both dates are provided
      // Set start to beginning of day and end to end of day to handle timezone issues
      const start = new Date(startDate + 'T00:00:00.000Z');
      const end = new Date(endDate + 'T23:59:59.999Z');
      
      bloodPressures = await BloodPressureService.getBloodPressuresByDateRange(
        user.id,
        start,
        end
      );
    } else {
      // Get all blood pressures if no date range specified
      bloodPressures = await BloodPressureService.getBloodPressuresByProfile(
        user.id
      );
    }

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