import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { ActivityService } from "@/lib/services/activity.service";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, duration } = body;

    const activity = await ActivityService.createActivity({
      type,
      duration: parseInt(duration),
      capturedDate: new Date(),
      profileId: user.id,
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Error creating activity:", error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
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

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let activities;

    if (startDate && endDate) {
      activities = await ActivityService.getActivitiesByDateRange(
        user.id,
        new Date(startDate),
        new Date(endDate)
      );
    } else {
      activities = await ActivityService.getActivitiesByProfile(user.id);
    }

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}