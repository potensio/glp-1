import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { aiCalorieEstimationService } from "@/lib/services/ai-calorie-estimation.service";

export async function POST(request: NextRequest) {
  let foodDescription: string = '';
  let quantity: number | undefined;
  let unit: string | undefined;
  
  try {
    const user = await getUserFromRequest(request);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestBody = await request.json();
    foodDescription = requestBody.foodDescription;
    quantity = requestBody.quantity;
    unit = requestBody.unit;

    if (!foodDescription || typeof foodDescription !== 'string') {
      return NextResponse.json(
        { error: "Food description is required" },
        { status: 400 }
      );
    }

    // Use AI service for calorie estimation
    const result = await aiCalorieEstimationService.estimateCalories({
      foodDescription,
      quantity,
      unit
    });

  return NextResponse.json({
    calories: result.calories,
    confidence: result.confidence,
    nutrition: result.nutrition,
    portionSuggestions: result.portionSuggestions,
    estimatedPortion: result.estimatedPortion,
  });
  } catch (error) {
    console.error("Error estimating calories:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      foodDescription,
      quantity,
      unit,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        error: "Failed to estimate nutrition",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}