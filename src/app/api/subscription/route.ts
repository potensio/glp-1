import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import StripeService from "@/lib/services/stripe";

export async function GET(request: NextRequest) {
  try {
    // Get user from request (token)
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's current subscription with plan details
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: authUser.id,
        status: 'ACTIVE',
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: "No active subscription found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
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
          features: subscription.plan.features,
        },
      },
    });
  } catch (error: unknown) {
    console.error("Get subscription error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from request (token)
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { action, planId, priceId } = await request.json();

    if (action === 'create_checkout') {
      // Create Stripe checkout session for subscription
      if (!planId || !priceId) {
        return NextResponse.json(
          { success: false, error: "Plan ID and Price ID are required" },
          { status: 400 }
        );
      }

      // Get user profile for name
      const userProfile = await prisma.profile.findUnique({
        where: { id: authUser.id },
      });

      const userName = userProfile 
        ? `${userProfile.firstName} ${userProfile.lastName}` 
        : undefined;

      try {
        const session = await StripeService.createCheckoutSession({
          userId: authUser.id,
          planId,
          priceId,
          email: authUser.email,
          name: userName,
          successUrl: `${process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_URL || 'http://localhost:3000'}/home/billing?success=true`,
        cancelUrl: `${process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_URL || 'http://localhost:3000'}/home/billing?canceled=true`,
        });

        return NextResponse.json({
          success: true,
          data: {
            sessionId: session.id,
            url: session.url,
          },
        });
      } catch (error) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json(
          { success: false, error: "Failed to create checkout session" },
          { status: 500 }
        );
      }
    }

    if (action === 'cancel') {
      // Find user's active subscription
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId: authUser.id,
          status: 'ACTIVE',
        },
      });

      if (!subscription) {
        return NextResponse.json(
          { success: false, error: "No active subscription found" },
          { status: 404 }
        );
      }

      try {
        // Use Stripe service to cancel subscription
        await StripeService.cancelSubscription({
          subscriptionId: subscription.id,
          userId: authUser.id,
        });

        return NextResponse.json({
          success: true,
          message: "Subscription has been cancelled",
        });
      } catch (error) {
        console.error('Cancel subscription error:', error);
        return NextResponse.json(
          { success: false, error: "Failed to cancel subscription" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("Update subscription error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}