import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { Glp1Service } from "@/lib/services/glp1.service";

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

    await Glp1Service.deleteGlp1Entry(id, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting GLP-1 entry:", error);
    
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