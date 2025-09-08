import { NextRequest, NextResponse } from "next/server";
import { WaitlistService } from "@/lib/services/waitlist.service";
import { BrevoService } from "@/lib/services/brevo.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source, metadata } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate and create waitlist entry
    const waitlistEntry = await WaitlistService.addToWaitlist({
      email: email.toLowerCase().trim(),
      source: source || "landing-page",
      metadata: metadata || {},
    });

    // Add to Brevo email list (non-blocking - won't fail the main operation)
    const brevoResult = await BrevoService.addContactToList(
      waitlistEntry.email,
      {
        SOURCE: waitlistEntry.source,
        SIGNUP_DATE: waitlistEntry.createdAt.toISOString(),
        ...(waitlistEntry.metadata && typeof waitlistEntry.metadata === 'object' ? waitlistEntry.metadata : {}),
      }
    );

    // Log Brevo result but don't fail the request
    if (!brevoResult.success) {
      console.warn(
        `Failed to add ${waitlistEntry.email} to Brevo:`,
        brevoResult.error
      );
    }

    // Send welcome email using Brevo template (non-blocking)
    const emailResult = await BrevoService.sendWaitlistWelcomeEmail(
      waitlistEntry.email,
      undefined, // name - will be extracted from email
      {
        SOURCE: waitlistEntry.source,
        WAITLIST_POSITION: await WaitlistService.getWaitlistStats().then(stats => stats.total),
      }
    );

    // Log email result but don't fail the request
    if (!emailResult.success) {
      console.warn(
        `Failed to send welcome email to ${waitlistEntry.email}:`,
        emailResult.error
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully added to waitlist",
      data: {
        id: waitlistEntry.id,
        email: waitlistEntry.email,
        createdAt: waitlistEntry.createdAt,
        source: waitlistEntry.source,
      },
      // Include Brevo status for debugging (optional)
      brevoStatus: brevoResult.success ? "added" : "failed",
      emailStatus: emailResult.success ? "sent" : "failed",
      emailMessageId: emailResult.messageId,
    });
  } catch (error) {
    console.error("Error adding to waitlist:", error);

    // Handle validation errors
    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Handle duplicate email errors
    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json(
        { error: "Email is already on the waitlist" },
        { status: 409 }
      );
    }

    // Handle database constraint errors (Prisma unique constraint)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Email is already on the waitlist" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // This endpoint could be used for admin purposes to get waitlist stats
    // For now, we'll return basic stats without exposing email addresses
    const stats = await WaitlistService.getWaitlistStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error getting waitlist stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional: DELETE endpoint for removing from waitlist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    // Remove from database
    const removed = await WaitlistService.removeFromWaitlist(email);

    if (!removed) {
      return NextResponse.json(
        { error: "Email not found on waitlist" },
        { status: 404 }
      );
    }

    // Remove from Brevo (non-blocking)
    const brevoResult = await BrevoService.removeContactFromList(email);
    if (!brevoResult.success) {
      console.warn(`Failed to remove ${email} from Brevo:`, brevoResult.error);
    }

    return NextResponse.json({
      success: true,
      message: "Successfully removed from waitlist",
    });
  } catch (error) {
    console.error("Error removing from waitlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
