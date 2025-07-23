import Stripe from 'stripe';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { PaymentGateway, SubscriptionStatus, PaymentStatus } from '@prisma/client';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
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
  static async createOrGetCustomer(userId: string, email: string, name?: string): Promise<string> {
    // Check if user already has a Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    if (user?.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: { userId },
    });

    // Save customer ID to user record
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }

  /**
   * Create a subscription checkout session
   */
  static async createCheckoutSession(data: CreateSubscriptionInput & { 
    email: string; 
    name?: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    const validated = createSubscriptionSchema.parse(data);
    
    const customerId = await this.createOrGetCustomer(validated.userId, data.email, data.name);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: data.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
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
        status: SubscriptionStatus.ACTIVE,
      },
      include: {
        paymentMethods: true,
      },
    });

    if (!subscription) {
      throw new Error('Subscription not found or already cancelled');
    }

    // Find Stripe payment method
    const stripePaymentMethod = subscription.paymentMethods.find(
      (pm: any) => pm.gateway === PaymentGateway.STRIPE && pm.gatewaySubId
    );

    if (!stripePaymentMethod?.gatewaySubId) {
      throw new Error('Stripe subscription ID not found');
    }

    // Cancel in Stripe
    await stripe.subscriptions.cancel(stripePaymentMethod.gatewaySubId);

    // Update in database
    await prisma.subscription.update({
      where: { id: validated.subscriptionId },
      data: {
        status: SubscriptionStatus.CANCELED,
      },
    });

    return { success: true };
  }

  /**
   * Handle Stripe webhook events
   */
  static async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Handle successful checkout completion
   */
  private static async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const { userId, planId } = session.metadata || {};
    
    if (!userId || !planId || !session.subscription) {
      console.error('Missing metadata in checkout session');
      return;
    }

    // Get the subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string);
    
    // Get plan details
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      console.error('Plan not found:', planId);
      return;
    }

    // Create subscription in database
    const newSubscription = await prisma.subscription.create({
      data: {
        userId,
        planId,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
      },
    });

    // Create payment method record
    if (session.payment_method_types.includes('card')) {
      await prisma.paymentMethod.create({
        data: {
          subscriptionId: newSubscription.id,
          gateway: PaymentGateway.STRIPE,
          gatewayId: session.customer as string || '',
          gatewaySubId: stripeSubscription.id,
          isDefault: true,
        },
      });
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
        gateway: PaymentGateway.STRIPE,
        gatewaySubId: (invoice as any).subscription as string,
      },
      include: {
        subscription: true,
      },
    });

    if (!paymentMethod?.subscription) {
      console.error('Subscription not found for invoice:', invoice.id);
      return;
    }

    // Create payment record
    await prisma.payment.create({
      data: {
        subscriptionId: paymentMethod.subscription.id,
        paymentMethodId: paymentMethod.id,
        amount: invoice.amount_paid / 100, // Convert from cents
        currency: invoice.currency.toUpperCase(),
        status: PaymentStatus.COMPLETED,
        gatewayPaymentId: (invoice as any).payment_intent as string || invoice.id,
        paidAt: new Date(),
      },
    });
  }

  /**
   * Handle subscription updates
   */
  private static async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription) {
    // Find payment method with this Stripe subscription ID
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        gateway: PaymentGateway.STRIPE,
        gatewaySubId: stripeSubscription.id,
      },
    });

    if (!paymentMethod) {
      console.error('Payment method not found for subscription:', stripeSubscription.id);
      return;
    }

    await prisma.subscription.update({
      where: { id: paymentMethod.subscriptionId },
      data: {
        status: stripeSubscription.status === 'active' ? SubscriptionStatus.ACTIVE : SubscriptionStatus.CANCELED,
        currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
      },
    });
  }

  /**
   * Handle subscription deletion
   */
  private static async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription) {
    // Find payment method with this Stripe subscription ID
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        gateway: PaymentGateway.STRIPE,
        gatewaySubId: stripeSubscription.id,
      },
    });

    if (!paymentMethod) {
      console.error('Payment method not found for subscription:', stripeSubscription.id);
      return;
    }

    await prisma.subscription.update({
      where: { id: paymentMethod.subscriptionId },
      data: {
        status: SubscriptionStatus.CANCELED,
      },
    });
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }

    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}

export { stripe };
export default StripeService;