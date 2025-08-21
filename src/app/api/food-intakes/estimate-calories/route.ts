import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { aiCalorieEstimationService } from "@/lib/services/ai-calorie-estimation.service";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { foodDescription } = await request.json();

    if (!foodDescription || typeof foodDescription !== 'string') {
      return NextResponse.json(
        { error: "Food description is required" },
        { status: 400 }
      );
    }

    // Use AI service for calorie estimation
    const result = await aiCalorieEstimationService.estimateCalories({
      foodDescription
    });

    return NextResponse.json({ 
      estimatedCalories: result.calories,
      confidence: result.confidence,
      breakdown: result.breakdown
    });
  } catch (error) {
    console.error("Error estimating calories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}