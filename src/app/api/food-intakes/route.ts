import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { FoodIntakeService } from "@/lib/services/food-intake.service";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Use service layer for business logic
    const foodIntake = await FoodIntakeService.createFoodIntake({
      ...body,
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

    // Use service layer for business logic
    const foodIntakes = await FoodIntakeService.getFoodIntakesByProfile(
      user.id
    );

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
