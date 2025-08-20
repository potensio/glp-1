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
    const capturedDateObj = capturedDate ? new Date(capturedDate) : new Date();
    const dateCode = capturedDateObj.getDate().toString().padStart(2, '0') + 
                     (capturedDateObj.getMonth() + 1).toString().padStart(2, '0') + 
                     capturedDateObj.getFullYear().toString();
    
    const foodIntake = await FoodIntakeService.createFoodIntake({
      mealType,
      food,
      calories,
      capturedDate: capturedDateObj,
      profileId: user.id,
      dateCode,
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

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters for date filtering
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    // Generate dateCode from the date string (timezone-independent)
    const dateObj = new Date(date);
    const dateCode = dateObj.getDate().toString().padStart(2, '0') + 
                     (dateObj.getMonth() + 1).toString().padStart(2, '0') + 
                     dateObj.getFullYear().toString();

    // Use service layer to clear food intakes by dateCode
    const result = await FoodIntakeService.clearFoodIntakesByDateCode(
      user.id,
      dateCode
    );

    return NextResponse.json({ 
      message: `Deleted ${result.count} food intake entries for ${date}`,
      deletedCount: result.count 
    });
  } catch (error) {
    console.error("Error deleting food intakes:", error);

    if (error instanceof Error && error.message === "Profile not found") {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
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
      // Parse the ISO date strings directly
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Validate that the dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return NextResponse.json(
          { error: "Invalid date format. Please use ISO date strings." },
          { status: 400 }
        );
      }
      
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
