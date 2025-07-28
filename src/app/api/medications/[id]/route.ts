import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { MedicationService } from "@/services/medication.service";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const params = await context.params;
    const medicationId = params.id;

    // Use service layer for business logic
    const medication = await MedicationService.updateMedication(
      medicationId,
      user.id,
      body
    );

    return NextResponse.json(medication);
  } catch (error) {
    console.error("Error updating medication:", error);

    if (error instanceof Error) {
      if (error.message === "Medication not found") {
        return NextResponse.json(
          { error: "Medication not found" },
          { status: 404 }
        );
      }

      if (error.name === "ZodError") {
        return NextResponse.json(
          { error: "Invalid input data", details: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const medicationId = params.id;

    // Use service layer for business logic
    await MedicationService.deleteMedication(medicationId, user.id);

    return NextResponse.json({ message: "Medication deleted successfully" });
  } catch (error) {
    console.error("Error deleting medication:", error);

    if (error instanceof Error && error.message === "Medication not found") {
      return NextResponse.json(
        { error: "Medication not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
