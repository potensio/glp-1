import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { FoodIntakeService } from "@/lib/services/food-intake.service";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mealType, food, calories, capturedDate } = await request.json();

    // Validate required fields
    if (!mealType || !food || typeof calories !== 'number') {
      return NextResponse.json(
        { error: "Missing required fields: mealType, food, calories" },
        { status: 400 }
      );
    }

    // Use service layer for business logic
    const foodIntake = await FoodIntakeService.createFoodIntake({
      mealType,
      food,
      calories,
      capturedDate: capturedDate ? new Date(capturedDate) : new Date(),
      profileId: user.id,
    });

    return NextResponse.json(foodIntake, { status: 201 });
  } catch (error) {
    console.error("Error creating food intake:", error);

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

    // Use service layer for business logic
    let foodIntakes;
    if (startDate && endDate) {
      // Use date range filtering if both dates are provided
      // Set start to beginning of day and end to end of day to handle timezone issues
      const start = new Date(startDate + 'T00:00:00.000Z');
      const end = new Date(endDate + 'T23:59:59.999Z');
      
      foodIntakes = await FoodIntakeService.getFoodIntakesByDateRange(
        user.id,
        start,
        end
      );
    } else {
      // Get all food intakes if no date range specified
      foodIntakes = await FoodIntakeService.getFoodIntakesByProfile(user.id);
    }

    return NextResponse.json(foodIntakes);
  } catch (error) {
    console.error("Error fetching food intakes:", error);

    if (error instanceof Error && error.message === "Profile not found") {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
