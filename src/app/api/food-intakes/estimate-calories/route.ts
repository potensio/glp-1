import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

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

    // Call OpenRouter API for calorie estimation
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer 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`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
        'X-Title': 'GLP-1 Health Tracker'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are a nutrition expert. Given a food description, estimate the total calories. Respond with ONLY a number representing the estimated calories. Do not include any text, explanations, or units - just the numeric value.'
          },
          {
            role: 'user',
            content: `Estimate the calories for: ${foodDescription}`
          }
        ],
        temperature: 0.1,
        max_tokens: 10
      })
    });

    if (!openRouterResponse.ok) {
      console.error('OpenRouter API error:', await openRouterResponse.text());
      return NextResponse.json(
        { error: "Failed to estimate calories" },
        { status: 500 }
      );
    }

    const data = await openRouterResponse.json();
    const estimatedCalories = data.choices?.[0]?.message?.content?.trim();

    // Parse and validate the response
    const calories = parseInt(estimatedCalories);
    if (isNaN(calories) || calories <= 0) {
      return NextResponse.json(
        { error: "Could not estimate calories for this food" },
        { status: 400 }
      );
    }

    return NextResponse.json({ estimatedCalories: calories });
  } catch (error) {
    console.error("Error estimating calories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}