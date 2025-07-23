import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { ActivityService } from "@/lib/services/activity.service";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Activity ID is required" },
        { status: 400 }
      );
    }

    await ActivityService.deleteActivity(id, user.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting activity:", error);
    
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