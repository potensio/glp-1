import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { WeightService } from '@/lib/services/weight.service';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { weight, capturedDate } = await request.json();

    if (!weight || typeof weight !== 'number') {
      return NextResponse.json({ error: 'Weight is required and must be a number' }, { status: 400 });
    }

    // Use current date if capturedDate is not provided
    const dateToCapture = capturedDate ? new Date(capturedDate) : new Date();

    // Create weight entry using the service
    const weightEntry = await WeightService.createWeight({
      weight,
      capturedDate: dateToCapture,
      profileId: authUser.id,
    });

    return NextResponse.json(weightEntry);
  } catch (error) {
    console.error('Error creating weight entry:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's weight entries using the service
    const weights = await WeightService.getWeightsByProfile(authUser.id);

    return NextResponse.json(weights);
  } catch (error) {
    console.error('Error fetching weight entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}