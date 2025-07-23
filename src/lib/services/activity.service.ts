import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Client-side validation schema (for forms)
export const activitySchema = z.object({
  type: z.string().min(1, "Activity type is required"),
  duration: z.coerce
    .number()
    .min(1, "Duration must be at least 1 minute")
    .max(1440, "Duration must be less than 24 hours"),
});

export type ActivityInput = z.infer<typeof activitySchema>;

// Server-side validation schema (for API)
const createActivitySchema = z.object({
  type: z.string().min(1),
  duration: z.number().min(1).max(1440),
  capturedDate: z.date(),
  profileId: z.string(),
});

type CreateActivityInput = z.infer<typeof createActivitySchema>;

export class ActivityService {
  static async createActivity(data: CreateActivityInput) {
    // Validate input
    const validatedData = createActivitySchema.parse(data);

    // Check if profile exists
    const profile = await prisma.profile.findUnique({
      where: { id: validatedData.profileId },
    });

    if (!profile) {
      throw new Error("Profile not found");
    }

    // Create activity record
    return await prisma.activity.create({
      data: {
        type: validatedData.type,
        duration: validatedData.duration,
        capturedDate: validatedData.capturedDate,
        profileId: validatedData.profileId,
      },
    });
  }

  static async getActivitiesByProfile(profileId: string) {
    return await prisma.activity.findMany({
      where: { profileId },
      orderBy: { capturedDate: "desc" },
    });
  }

  static async getActivitiesByDateRange(
    profileId: string,
    startDate: Date,
    endDate: Date
  ) {
    return await prisma.activity.findMany({
      where: {
        profileId,
        capturedDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { capturedDate: "desc" },
    });
  }

  static async deleteActivity(id: string, profileId: string) {
    return await prisma.activity.delete({
      where: {
        id,
        profileId, // Ensure user can only delete their own activities
      },
    });
  }
}