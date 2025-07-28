import { NextRequest, NextResponse } from "next/server";
import {
  updateJournal,
  deleteJournal,
  getJournalById,
} from "@/lib/services/journal.service";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const journal = await getJournalById(id);

    if (!journal) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    // Check if the journal belongs to the user
    if (journal.profileId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(journal);
  } catch (error) {
    console.error("Error fetching journal:", error);
    return NextResponse.json(
      { error: "Failed to fetch journal" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    // First check if journal exists and belongs to user
    const existingJournal = await getJournalById(id);
    if (!existingJournal) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    if (existingJournal.profileId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, capturedDate } = body;

    const updatedJournal = await updateJournal(id, {
      title,
      content,
      capturedDate: capturedDate ? new Date(capturedDate) : undefined,
    });

    return NextResponse.json(updatedJournal);
  } catch (error) {
    console.error("Error updating journal:", error);
    return NextResponse.json(
      { error: "Failed to update journal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    // First check if journal exists and belongs to user
    const existingJournal = await getJournalById(id);
    if (!existingJournal) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    if (existingJournal.profileId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteJournal(id);
    return NextResponse.json({ message: "Journal deleted successfully" });
  } catch (error) {
    console.error("Error deleting journal:", error);
    return NextResponse.json(
      { error: "Failed to delete journal" },
      { status: 500 }
    );
  }
}
