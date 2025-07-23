import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Client-side validation schema (for forms)
export const weightSchema = z.object({
  weight: z.coerce
    .number()
    .min(50, "Weight must be at least 50 lbs")
    .max(1000, "Weight must be less than 1000 lbs"),
});

export type WeightInput = z.infer<typeof weightSchema>;

// Server-side validation schema (for API)
const createWeightSchema = z.object({
  weight: z.number().min(50).max(1000),
  capturedDate: z.date(),
  profileId: z.string(),
});

type CreateWeightInput = z.infer<typeof createWeightSchema>;

export class WeightService {
  static async createWeight(data: CreateWeightInput) {
    // Validate input
    const validatedData = createWeightSchema.parse(data);

    // Check if profile exists
    const profile = await prisma.profile.findUnique({
      where: { id: validatedData.profileId },
    });

    if (!profile) {
      throw new Error("Profile not found");
    }

    // Create weight record
    return await prisma.weight.create({
      data: {
        weight: validatedData.weight,
        capturedDate: validatedData.capturedDate,
        profileId: validatedData.profileId,
      },
    });
  }

  static async getWeightsByProfile(profileId: string) {
    return await prisma.weight.findMany({
      where: { profileId },
      orderBy: { capturedDate: "desc" },
    });
  }

  static async getWeightsByDateRange(
    profileId: string,
    startDate: Date,
    endDate: Date
  ) {
    return await prisma.weight.findMany({
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

  static async getLatestWeight(profileId: string) {
    return await prisma.weight.findFirst({
      where: { profileId },
      orderBy: { capturedDate: "desc" },
    });
  }

  static async deleteWeight(id: string, profileId: string) {
    return await prisma.weight.delete({
      where: {
        id,
        profileId, // Ensure user can only delete their own weights
      },
    });
  }
}