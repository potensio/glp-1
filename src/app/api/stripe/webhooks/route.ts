import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import StripeService from '@/lib/services/stripe';

export async function POST(request: NextRequest) {
  console.log('🔔 Stripe webhook received');
  
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    console.log('📝 Webhook body length:', body.length);
    console.log('🔐 Signature present:', !!signature);

    if (!signature) {
      console.error('❌ Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature and construct event
    const event = StripeService.verifyWebhookSignature(body, signature);
    console.log('✅ Event verified, type:', event.type);
    console.log('📊 Event data:', JSON.stringify(event.data.object, null, 2));

    // Handle the event
    await StripeService.handleWebhook(event);
    console.log('🎉 Webhook processed successfully');

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Disable body parsing for webhooks
export const runtime = 'nodejs';