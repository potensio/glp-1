import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { FoodIntakeService } from "@/lib/services/food-intake.service";
import { z } from "zod";

// Schema for validating multiple food intake entries
const createMultipleFoodIntakeSchema = z.object({
  entries: z
    .array(
      z.object({
        mealType: z.string().min(1, "Meal type is required"),
        food: z.string().min(1, "Food description is required"),
        calories: z
          .number()
          .min(1, "Calories must be at least 1")
          .max(10000, "Calories must be less than 10,000"),
        capturedDate: z.string(), // ISO date string
      })
    )
    .min(1, "At least one entry is required"),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createMultipleFoodIntakeSchema.parse(body);

    // Convert entries to the format expected by the service
    // capturedDate comes from frontend in user's timezone as ISO string
    const entriesForService = validatedData.entries.map((entry) => ({
      mealType: entry.mealType,
      food: entry.food,
      calories: entry.calories,
      capturedDate: new Date(entry.capturedDate), // Preserves user timezone
    }));

    // Use the clear-before-submit strategy
    const createdEntries =
      await FoodIntakeService.createMultipleFoodIntakesWithClear(
        user.id,
        entriesForService
      );

    return NextResponse.json({
      success: true,
      entries: createdEntries,
      message: `Successfully logged ${createdEntries.length} food intake entries`,
    });
  } catch (error) {
    console.error("Error creating multiple food intake entries:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create food intake entries",
      },
      { status: 500 }
    );
  }
}
