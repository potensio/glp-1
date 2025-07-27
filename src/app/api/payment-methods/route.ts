import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// GET /api/payment-methods - Fetch payment methods for a user
export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    if (!profileId || profileId !== authUser.id) {
      return NextResponse.json(
        { success: false, error: "Invalid profile ID" },
        { status: 400 }
      );
    }

    // Find user's subscriptions and their payment methods
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: authUser.id,
      },
      include: {
        paymentMethods: {
          where: {
            isActive: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    // Flatten payment methods from all subscriptions
    const paymentMethods = subscriptions.flatMap(sub => 
      sub.paymentMethods.map(pm => ({
        id: pm.id,
        subscriptionId: pm.subscriptionId,
        gateway: pm.gateway,
        gatewayId: pm.gatewayId,
        gatewaySubId: pm.gatewaySubId,
        isDefault: pm.isDefault,
        isActive: pm.isActive,
        metadata: pm.metadata,
        createdAt: pm.createdAt.toISOString(),
        updatedAt: pm.updatedAt.toISOString(),
        // Add UI-friendly fields if available in metadata
        last4: (pm.metadata as any)?.last4 || undefined,
        exp: (pm.metadata as any)?.exp || undefined,
        brand: (pm.metadata as any)?.brand || undefined,
      }))
    );

    return NextResponse.json({
      success: true,
      data: paymentMethods,
    });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/payment-methods - Add a new payment method
export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { gateway, gatewayId, isDefault = false } = await request.json();

    if (!gateway || !gatewayId) {
      return NextResponse.json(
        { success: false, error: "Gateway and gateway ID are required" },
        { status: 400 }
      );
    }

    // Find user's active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: authUser.id,
        status: "ACTIVE",
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: "No active subscription found" },
        { status: 400 }
      );
    }

    // Check if payment method already exists for this subscription and gateway
    const existingPaymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        subscriptionId: subscription.id,
        gateway: gateway.toUpperCase(),
      },
    });

    if (existingPaymentMethod) {
      // Update existing payment method
      const updatedPaymentMethod = await prisma.paymentMethod.update({
        where: { id: existingPaymentMethod.id },
        data: {
          gatewayId,
          isDefault,
          isActive: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: updatedPaymentMethod.id,
          subscriptionId: updatedPaymentMethod.subscriptionId,
          gateway: updatedPaymentMethod.gateway,
          gatewayId: updatedPaymentMethod.gatewayId,
          gatewaySubId: updatedPaymentMethod.gatewaySubId,
          isDefault: updatedPaymentMethod.isDefault,
          isActive: updatedPaymentMethod.isActive,
          metadata: updatedPaymentMethod.metadata,
          createdAt: updatedPaymentMethod.createdAt.toISOString(),
          updatedAt: updatedPaymentMethod.updatedAt.toISOString(),
        },
      });
    } else {
      // Create new payment method
      const newPaymentMethod = await prisma.paymentMethod.create({
        data: {
          subscriptionId: subscription.id,
          gateway: gateway.toUpperCase(),
          gatewayId,
          isDefault,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: newPaymentMethod.id,
          subscriptionId: newPaymentMethod.subscriptionId,
          gateway: newPaymentMethod.gateway,
          gatewayId: newPaymentMethod.gatewayId,
          gatewaySubId: newPaymentMethod.gatewaySubId,
          isDefault: newPaymentMethod.isDefault,
          isActive: newPaymentMethod.isActive,
          metadata: newPaymentMethod.metadata,
          createdAt: newPaymentMethod.createdAt.toISOString(),
          updatedAt: newPaymentMethod.updatedAt.toISOString(),
        },
      });
    }
  } catch (error) {
    console.error("Error adding payment method:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}