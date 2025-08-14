# Stripe Integration Setup

This document outlines the Stripe payment integration for the GLP-1 tracking application.

## Overview

The application now supports Stripe payments for subscription management with the following features:

- Stripe Checkout for subscription creation
- Webhook handling for payment events
- Subscription cancellation
- Multi-gateway support (prepared for PayPal)

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY='pk_test_your_stripe_publishable_key_here'
STRIPE_SECRET_KEY='sk_test_your_stripe_secret_key_here'
STRIPE_WEBHOOK_SECRET='whsec_your_webhook_secret_here'

```

## Setup Steps

1. **Create Stripe Account**: Sign up at [stripe.com](https://stripe.com)

2. **Get API Keys**:

   - Go to Stripe Dashboard > Developers > API keys
   - Copy your publishable key and secret key
   - Replace the placeholder values in `.env`

3. **Create Products in Stripe**:

   - Go to Stripe Dashboard > Products
   - Create a product for your Premium plan
   - Note the Price ID (starts with `price_`)
   - Update your database seed with the correct Stripe Price ID

4. **Setup Webhooks**:
   - Go to Stripe Dashboard > Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe/webhooks`
   - Select events: `invoice.payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the webhook secret and add to `.env`

## Database Schema

The integration uses the existing subscription system with these key models:

- `User` - now includes `stripeCustomerId`
- `Subscription` - manages subscription state
- `PaymentMethod` - stores gateway information
- `Payment` - records payment transactions

## API Endpoints

### Create Checkout Session

```http
POST /api/subscription
Content-Type: application/json

{
  "action": "create_checkout",
  "planId": "plan_id_here",
  "priceId": "stripe_price_id_here"
}
```

### Cancel Subscription

```http
POST /api/subscription
Content-Type: application/json

{
  "action": "cancel"
}
```

### Webhook Endpoint

```http
POST /api/stripe/webhooks
```

## Frontend Integration

The integration includes:

- `StripeClientService` for client-side operations
- Enhanced `useSubscription` hook with checkout functionality
- Updated `PlanCard` component with upgrade button

## Usage Flow

1. User clicks "Upgrade to Premium" on billing page
2. `createCheckout` function calls `/api/subscription` with `create_checkout` action
3. Stripe Checkout session is created and user is redirected
4. After payment, Stripe sends webhook events
5. Webhook handler updates subscription status in database
6. User is redirected back to billing page with success message

## Testing

Use Stripe's test card numbers:

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

For webhook testing, use Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```

## Security Notes

- Webhook signatures are verified using `STRIPE_WEBHOOK_SECRET`
- Sensitive operations are server-side only
- Customer IDs are stored securely in the database
- All Stripe API calls include error handling

## Future Enhancements

- PayPal integration (schema already supports multiple gateways)
- Subscription plan changes
- Proration handling
- Invoice management
- Usage-based billing
