import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Client-side validation schema
export const waitlistClientSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  source: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Server-side validation schema (more strict)
export const waitlistServerSchema = z.object({
  email: z.string().email().min(1).max(255),
  source: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type WaitlistInput = z.infer<typeof waitlistServerSchema>;

export class WaitlistService {
  /**
   * Add email to waitlist
   */
  static async addToWaitlist(data: WaitlistInput) {
    try {
      // Validate input data
      const validatedData = waitlistServerSchema.parse(data);

      // Check if email already exists
      const existingEntry = await prisma.waitlist.findUnique({
        where: { email: validatedData.email.toLowerCase().trim() },
      });

      if (existingEntry) {
        throw new Error(
          `Email ${validatedData.email} already exists on the waitlist`
        );
      }

      // Create new waitlist entry
      const waitlistEntry = await prisma.waitlist.create({
        data: {
          email: validatedData.email.toLowerCase().trim(),
          source: validatedData.source || "landing-page",
          metadata: validatedData.metadata || {},
        },
      });

      return waitlistEntry;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation failed: ${error.issues
            .map((e: any) => e.message)
            .join(", ")}`
        );
      }
      throw error;
    }
  }

  /**
   * Get all waitlist entries (for admin use)
   */
  static async getAllEntries() {
    try {
      return await prisma.waitlist.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get waitlist entries with pagination
   */
  static async getEntries(page: number = 1, limit: number = 50) {
    try {
      const skip = (page - 1) * limit;

      const [entries, total] = await Promise.all([
        prisma.waitlist.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.waitlist.count(),
      ]);

      return {
        entries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get waitlist entry by email
   */
  static async getByEmail(email: string) {
    try {
      const validatedEmail = z
        .string()
        .email()
        .parse(email.toLowerCase().trim());

      return await prisma.waitlist.findUnique({
        where: { email: validatedEmail },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation failed: ${error.issues
            .map((e: any) => e.message)
            .join(", ")}`
        );
      }
      throw error;
    }
  }

  /**
   * Remove email from waitlist
   */
  static async removeFromWaitlist(email: string) {
    try {
      const validatedEmail = z
        .string()
        .email()
        .parse(email.toLowerCase().trim());

      const deleted = await prisma.waitlist.delete({
        where: { email: validatedEmail },
      });

      return deleted;
    } catch (error: any) {
      // Handle case where email doesn't exist
      if (error.code === "P2025") {
        return null;
      }

      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation failed: ${error.issues
            .map((e: any) => e.message)
            .join(", ")}`
        );
      }
      throw error;
    }
  }

  /**
   * Get waitlist statistics
   */
  static async getWaitlistStats() {
    try {
      const [total, todayCount, weekCount] = await Promise.all([
        // Total count
        prisma.waitlist.count(),

        // Today's signups
        prisma.waitlist.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),

        // This week's signups
        prisma.waitlist.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

      // Get source breakdown
      const sourceStats = await prisma.waitlist.groupBy({
        by: ["source"],
        _count: {
          source: true,
        },
      });

      return {
        total,
        today: todayCount,
        thisWeek: weekCount,
        sources: sourceStats.reduce((acc, stat) => {
          acc[stat.source || "unknown"] = stat._count.source;
          return acc;
        }, {} as Record<string, number>),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if email is already on waitlist
   */
  static async isEmailOnWaitlist(email: string): Promise<boolean> {
    const entry = await this.getByEmail(email);
    return entry !== null;
  }
}