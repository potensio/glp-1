import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Check if plans already exist
  const existingPlans = await prisma.plan.findMany()
  
  if (existingPlans.length === 0) {
    // Create Free Plan
    const freePlan = await prisma.plan.create({
      data: {
        name: 'Free',
        description: 'Basic health tracking features',
        price: 0,
        currency: 'USD',
        interval: 'month',
        stripePriceId: null, // Free plan doesn't need Stripe price ID
        features: {
          maxEntries: 50,
          basicCharts: true,
          dataExport: false,
          premiumSupport: false,
          advancedAnalytics: false
        },
        isActive: true
      }
    })

    // Create Premium Plan
    const premiumPlan = await prisma.plan.create({
      data: {
        name: 'Premium',
        description: 'Advanced health tracking with unlimited features',
        price: 9.00,
        currency: 'USD',
        interval: 'month',
        stripePriceId: 'price_1QdKJhP8XfaQlVhYKwZvQzJm', // Test price ID - replace with actual Stripe price ID
        features: {
          maxEntries: -1, // unlimited
          basicCharts: true,
          advancedCharts: true,
          dataExport: true,
          premiumSupport: true,
          advancedAnalytics: true,
          customReports: true
        },
        isActive: true
      }
    })

    console.log('✅ Created plans:')
     console.log('  - Free Plan:', freePlan.id)
     console.log('  - Premium Plan:', premiumPlan.id)
   } else {
     console.log('📋 Plans already exist, skipping creation')
   }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })