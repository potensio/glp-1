import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Mock user ID since authentication is removed
    const userId = 'mock-user-id';

    const { weight } = await request.json();

    if (!weight || typeof weight !== 'number') {
      return NextResponse.json({ error: 'Weight is required and must be a number' }, { status: 400 });
    }

    // Create weight entry
    const weightEntry = await prisma.weight.create({
      data: {
        weight,
        profileId: userId,
      },
    });

    return NextResponse.json(weightEntry);
  } catch (error) {
    console.error('Error creating weight entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Mock user ID since authentication is removed
    const userId = 'mock-user-id';

    // Get user's weight entries, ordered by creation date (newest first)
    const weights = await prisma.weight.findMany({
      where: {
        profileId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(weights);
  } catch (error) {
    console.error('Error fetching weight entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}