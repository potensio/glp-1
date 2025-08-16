import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { Glp1Service } from "@/lib/services/glp1.service";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, dose, capturedDate } = body;

    const glp1Entry = await Glp1Service.createGlp1Entry({
      type,
      dose: parseFloat(dose),
      capturedDate: capturedDate ? new Date(capturedDate) : new Date(),
      profileId: user.id,
    });

    return NextResponse.json(glp1Entry, { status: 201 });
  } catch (error) {
    console.error("Error creating GLP-1 entry:", error);
    
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

    let glp1Entries;

    if (startDate && endDate) {
      glp1Entries = await Glp1Service.getGlp1EntriesByDateRange(
        user.id,
        new Date(startDate),
        new Date(endDate)
      );
    } else {
      glp1Entries = await Glp1Service.getGlp1EntriesByProfile(user.id);
    }

    return NextResponse.json(glp1Entries);
  } catch (error) {
    console.error("Error fetching GLP-1 entries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}