import Stripe from "stripe";
import { z } from "zod";
import { db as prisma } from "@/lib/db";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

// Validation schemas
export const createSubscriptionSchema = z.object({
  userId: z.string(),
  planId: z.string(),
  priceId: z.string(),
});

export const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string(),
  userId: z.string(),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>;

export class StripeService {
  /**
   * Create or get existing Stripe customer
   */
  static async createOrGetCustomer(
    userId: string,
    email: string,
    name?: string
  ): Promise<string> {
    // Check if user already has a Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    // For now, create a new customer each time
    // TODO: Add stripeCustomerId field to User model in schema

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: { userId },
    });

    // TODO: Save customer ID to user record when stripeCustomerId field is added
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: { stripeCustomerId: customer.id },
    // });

    return customer.id;
  }

  /**
   * Create a subscription checkout session
   */
  static async createCheckoutSession(
    data: CreateSubscriptionInput & {
      email: string;
      name?: string;
      successUrl: string;
      cancelUrl: string;
    }
  ) {
    const validated = createSubscriptionSchema.parse(data);

    const customerId = await this.createOrGetCustomer(
      validated.userId,
      data.email,
      data.name
    );

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: data.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      metadata: {
        userId: validated.userId,
        planId: validated.planId,
      },
    });

    return session;
  }

  /**
   * Cancel a subscription
   */
  static async cancelSubscription(data: CancelSubscriptionInput) {
    const validated = cancelSubscriptionSchema.parse(data);

    // Get subscription from database
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: validated.subscriptionId,
        userId: validated.userId,
        status: "ACTIVE",
      },
      include: {
        paymentMethods: true,
      },
    });

    if (!subscription) {
      throw new Error("Subscription not found or already cancelled");
    }

    // Find Stripe payment method
    const stripePaymentMethod = subscription.paymentMethods.find(
      (pm: any) => pm.gateway === "STRIPE" && pm.gatewaySubId
    );

    if (!stripePaymentMethod?.gatewaySubId) {
      throw new Error("Stripe subscription ID not found");
    }

    // Cancel in Stripe
    await stripe.subscriptions.cancel(stripePaymentMethod.gatewaySubId);

    // Update in database
    await prisma.subscription.update({
      where: { id: validated.subscriptionId },
      data: {
        status: "CANCELED",
      },
    });

    return { success: true };
  }

  /**
   * Handle Stripe webhook events
   */
  static async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case "checkout.session.completed":
        await this.handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "invoice.payment_succeeded":
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case "customer.subscription.updated":
        await this.handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        await this.handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Handle successful checkout completion
   */
  private static async handleCheckoutCompleted(
    session: Stripe.Checkout.Session
  ) {
    console.log("🛒 Processing checkout completion");
    console.log("📋 Session metadata:", session.metadata);
    console.log("🔗 Session subscription:", session.subscription);

    const { userId, planId } = session.metadata || {};

    console.log("👤 User ID:", userId);
    console.log("📦 Plan ID:", planId);

    if (!userId || !planId || !session.subscription) {
      console.error("❌ Missing metadata in checkout session:", {
        userId: !!userId,
        planId: !!planId,
        subscription: !!session.subscription,
      });
      return;
    }

    // Get the subscription from Stripe with expanded payment method
    const stripeSubscription = await stripe.subscriptions.retrieve(
      session.subscription as string,
      {
        expand: ["default_payment_method"],
      }
    );

    // Get plan details
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      console.error("Plan not found:", planId);
      return;
    }

    // Check if user already has a subscription (e.g., free plan from signup)
    const existingSubscription = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" }, // Get the most recent subscription
    });

    let subscription;

    if (existingSubscription) {
      // Update existing subscription to the new paid plan
      subscription = await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          planId,
          status: "ACTIVE",
          currentPeriodStart: (stripeSubscription as any).current_period_start
            ? new Date((stripeSubscription as any).current_period_start * 1000)
            : new Date(),
          currentPeriodEnd: (stripeSubscription as any).current_period_end
            ? new Date((stripeSubscription as any).current_period_end * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          cancelAtPeriodEnd: false,
        },
      });
      console.log(
        `Updated existing subscription ${existingSubscription.id} for user ${userId} to plan ${planId}`
      );
    } else {
      // Create new subscription if none exists
      subscription = await prisma.subscription.create({
        data: {
          userId,
          planId,
          status: "ACTIVE",
          currentPeriodStart: (stripeSubscription as any).current_period_start
            ? new Date((stripeSubscription as any).current_period_start * 1000)
            : new Date(),
          currentPeriodEnd: (stripeSubscription as any).current_period_end
            ? new Date((stripeSubscription as any).current_period_end * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
      });
      console.log(
        `Created new subscription ${subscription.id} for user ${userId} with plan ${planId}`
      );
    }

    // Create or update payment method record with card details
    if (session.payment_method_types.includes("card")) {
      // Extract payment method details from Stripe subscription
      let cardMetadata = {};

      if (
        stripeSubscription.default_payment_method &&
        typeof stripeSubscription.default_payment_method === "object" &&
        "card" in stripeSubscription.default_payment_method
      ) {
        const paymentMethod =
          stripeSubscription.default_payment_method as Stripe.PaymentMethod;
        if (paymentMethod.card) {
          cardMetadata = {
            last4: paymentMethod.card.last4,
            brand: paymentMethod.card.brand,
            exp_month: paymentMethod.card.exp_month,
            exp_year: paymentMethod.card.exp_year,
            funding: paymentMethod.card.funding,
          };
          console.log("💳 Card details extracted:", cardMetadata);
        }
      }

      // Check if payment method already exists for this subscription and gateway
      const existingPaymentMethod = await prisma.paymentMethod.findFirst({
        where: {
          subscriptionId: subscription.id,
          gateway: "STRIPE",
        },
      });

      if (existingPaymentMethod) {
        // Update existing payment method with card details
        await prisma.paymentMethod.update({
          where: { id: existingPaymentMethod.id },
          data: {
            gatewayId: (session.customer as string) || "",
            gatewaySubId: stripeSubscription.id,
            isDefault: true,
            isActive: true,
            metadata: cardMetadata,
          },
        });
        console.log(
          `Updated existing payment method ${existingPaymentMethod.id} for subscription ${subscription.id} with card details`
        );
      } else {
        // Create new payment method with card details
        await prisma.paymentMethod.create({
          data: {
            subscriptionId: subscription.id,
            gateway: "STRIPE",
            gatewayId: (session.customer as string) || "",
            gatewaySubId: stripeSubscription.id,
            isDefault: true,
            metadata: cardMetadata,
          },
        });
        console.log(
          `Created new payment method for subscription ${subscription.id} with card details`
        );
      }
    }
  }

  /**
   * Handle successful payment
   */
  private static async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    if (!(invoice as any).subscription) return;

    // Find subscription by Stripe subscription ID
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        gateway: "STRIPE",
        gatewaySubId: (invoice as any).subscription as string,
      },
      include: {
        subscription: true,
      },
    });

    if (!paymentMethod?.subscription) {
      console.error("Subscription not found for invoice:", invoice.id);
      return;
    }

    // Create payment record
    await prisma.payment.create({
      data: {
        subscriptionId: paymentMethod.subscription.id,
        paymentMethodId: paymentMethod.id,
        amount: invoice.amount_paid / 100, // Convert from cents
        currency: invoice.currency.toUpperCase(),
        status: "COMPLETED",
        gatewayPaymentId:
          ((invoice as any).payment_intent as string) || invoice.id,
        paidAt: new Date(),
      },
    });
  }

  /**
   * Handle failed payment
   */
  private static async handlePaymentFailed(invoice: Stripe.Invoice) {
    if (!(invoice as any).subscription) return;

    // Find subscription by Stripe subscription ID
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        gateway: "STRIPE",
        gatewaySubId: (invoice as any).subscription as string,
      },
      include: {
        subscription: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!paymentMethod?.subscription) {
      console.error("Subscription not found for failed invoice:", invoice.id);
      return;
    }

    // Create failed payment record
    await prisma.payment.create({
      data: {
        subscriptionId: paymentMethod.subscription.id,
        paymentMethodId: paymentMethod.id,
        amount: invoice.amount_due / 100, // Convert from cents
        currency: invoice.currency.toUpperCase(),
        status: "FAILED",
        gatewayPaymentId:
          ((invoice as any).payment_intent as string) || invoice.id,
        failureReason: "Payment failed - insufficient funds or card declined",
      },
    });

    // Downgrade to free plan after payment failure
    await this.downgradeToFreePlan(paymentMethod.subscription.userId);
  }

  /**
   * Downgrade user to free plan
   */
  private static async downgradeToFreePlan(userId: string) {
    // Find the free plan
    const freePlan = await prisma.plan.findFirst({
      where: {
        name: "Free",
        isActive: true,
      },
    });

    if (!freePlan) {
      console.error("Free plan not found for downgrade");
      return;
    }

    // Update user's subscription to free plan
    await prisma.subscription.update({
      where: { userId },
      data: {
        planId: freePlan.id,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        cancelAtPeriodEnd: false,
      },
    });

    console.log(
      `User ${userId} downgraded to free plan due to payment failure`
    );
  }

  /**
   * Handle subscription updates
   */
  private static async handleSubscriptionUpdated(
    stripeSubscription: Stripe.Subscription
  ) {
    // Find payment method with this Stripe subscription ID
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        gateway: "STRIPE",
        gatewaySubId: stripeSubscription.id,
      },
    });

    if (!paymentMethod) {
      console.error(
        "Payment method not found for subscription:",
        stripeSubscription.id
      );
      return;
    }

    await prisma.subscription.update({
      where: { id: paymentMethod.subscriptionId },
      data: {
        status: stripeSubscription.status === "active" ? "ACTIVE" : "CANCELED",
        currentPeriodStart: (stripeSubscription as any).current_period_start
          ? new Date((stripeSubscription as any).current_period_start * 1000)
          : new Date(),
        currentPeriodEnd: (stripeSubscription as any).current_period_end
          ? new Date((stripeSubscription as any).current_period_end * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });
  }

  /**
   * Handle subscription deletion
   */
  private static async handleSubscriptionDeleted(
    stripeSubscription: Stripe.Subscription
  ) {
    // Find payment method with this Stripe subscription ID
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        gateway: "STRIPE",
        gatewaySubId: stripeSubscription.id,
      },
    });

    if (!paymentMethod) {
      console.error(
        "Payment method not found for subscription:",
        stripeSubscription.id
      );
      return;
    }

    await prisma.subscription.update({
      where: { id: paymentMethod.subscriptionId },
      data: {
        status: "CANCELED",
      },
    });
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(
    payload: string,
    signature: string
  ): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    }

    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}

export { stripe };
export default StripeService;
