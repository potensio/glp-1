import { NextRequest, NextResponse } from "next/server";
import { getUserWithProfileFromRequest } from "@/lib/auth";
import {
  getDoctorNote,
  upsertDoctorNote,
  createDoctorNoteSchema,
} from "@/lib/services/doctor-note.service";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserWithProfileFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctorNote = await getDoctorNote(user.id);

    return NextResponse.json(doctorNote);
  } catch (error) {
    console.error("Error fetching doctor note:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctor note" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserWithProfileFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createDoctorNoteSchema.parse(body);

    const doctorNote = await upsertDoctorNote(user.id, validatedData);

    return NextResponse.json(doctorNote);
  } catch (error) {
    console.error("Error saving doctor note:", error);
    return NextResponse.json(
      { error: "Failed to save doctor note" },
      { status: 500 }
    );
  }
}
