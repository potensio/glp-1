import { NextRequest, NextResponse } from "next/server";
import { getUserWithProfileFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get user with profile in a single optimized query
    const user = await getUserWithProfileFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user's current subscription with plan details
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: "ACTIVE",
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const subscriptionData = subscription ? {
      id: subscription.id,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      plan: {
        id: subscription.plan.id,
        name: subscription.plan.name,
        description: subscription.plan.description,
        price: subscription.plan.price,
        currency: subscription.plan.currency,
        interval: subscription.plan.interval,
        features: subscription.plan.features,
      },
    } : null;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
      profile: user.profile,
      subscription: subscriptionData,
    });
  } catch (error: unknown) {
    console.error("Get current user error:", error);
    
    return NextResponse.json(
      {
        error: "Failed to get user information",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}