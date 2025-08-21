# GLP-1 Health Tracker

A comprehensive health tracking application for GLP-1 medication users, built with Next.js, Prisma, and modern web technologies.

## Features

- **Health Tracking**: Weight, blood pressure, blood sugar, and medication logging
- **Food Intake**: AI-powered calorie estimation using OpenAI or OpenRouter API
- **Progress Visualization**: Interactive charts and progress tracking
- **Google Calendar Integration**: Sync health events with your calendar
- **Subscription Management**: Stripe-powered billing system
- **Secure Authentication**: JWT-based auth with profile management

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database (we recommend [Neon](https://neon.tech))
- Required API keys (see Environment Setup below)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd glp1
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables (see Environment Setup below)

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Setup

Copy `.env.local` and update the following required environment variables:

### Database
```env
DATABASE_URL="your_neon_database_url_here"
```

### Authentication
```env
JWT_SECRET="your_jwt_secret_here"
```

### AI API (for calorie estimation)
```env
AI_API_KEY="your_ai_api_key_here"
AI_PROVIDER="openrouter"  # or "openai"
```

**To get an API key:**

**For OpenRouter (default):**
1. Visit [OpenRouter](https://openrouter.ai/keys)
2. Sign up for an account
3. Generate a new API key
4. Add credits to your account for API usage
5. Set `AI_PROVIDER=openrouter` and `AI_API_KEY` to your OpenRouter key

**For OpenAI:**
1. Visit [OpenAI API](https://platform.openai.com/api-keys)
2. Sign up for an account
3. Generate a new API key
4. Add credits to your account for API usage
5. Set `AI_PROVIDER=openai` and `AI_API_KEY` to your OpenAI key

### Stripe (for billing)
```env
STRIPE_SECRET_KEY="your_stripe_secret_key_here"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key_here"
STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret_here"
```

### Google OAuth (for calendar integration)
```env
GOOGLE_CLIENT_ID="your_google_client_id_here"
GOOGLE_CLIENT_SECRET="your_google_client_secret_here"
```

### Email Service (Resend)
```env
RESEND_API_KEY="your_resend_api_key_here"
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

### File Upload (Vercel Blob)
```env
BLOB_READ_WRITE_TOKEN="your_blob_token_here"
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
