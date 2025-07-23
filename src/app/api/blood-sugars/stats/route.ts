import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { BloodSugarService } from "@/lib/services/blood-sugar.service";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    const stats = await BloodSugarService.getBloodSugarStats(user.id, days);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching blood sugar stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}