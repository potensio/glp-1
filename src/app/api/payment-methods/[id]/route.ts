import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// DELETE /api/payment-methods/[id] - Delete a payment method
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const paymentMethodId = params.id;

    if (!paymentMethodId) {
      return NextResponse.json(
        { success: false, error: "Payment method ID is required" },
        { status: 400 }
      );
    }

    // Find the payment method and verify ownership
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        id: paymentMethodId,
        subscription: {
          userId: authUser.id,
        },
      },
      include: {
        subscription: true,
      },
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Payment method not found" },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    await prisma.paymentMethod.update({
      where: { id: paymentMethodId },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment method deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}