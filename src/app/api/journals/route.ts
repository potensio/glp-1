import { NextRequest, NextResponse } from "next/server";
import {
  createJournal,
  getJournalsByProfileId,
} from "@/lib/services/journal.service";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, capturedDate } = body;

    const journal = await createJournal({
      title,
      content,
      capturedDate: new Date(capturedDate),
      profileId: user.id,
    });

    return NextResponse.json(journal, { status: 201 });
  } catch (error) {
    console.error("Error creating journal:", error);
    return NextResponse.json(
      { error: "Failed to create journal" },
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

    const journals = await getJournalsByProfileId(user.id);
    return NextResponse.json(journals);
  } catch (error) {
    console.error("Error fetching journals:", error);
    return NextResponse.json(
      { error: "Failed to fetch journals" },
      { status: 500 }
    );
  }
}
