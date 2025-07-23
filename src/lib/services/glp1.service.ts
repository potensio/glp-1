import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Client-side validation schema (for forms)
export const glp1Schema = z.object({
  type: z.enum(["Ozempic", "Wegovy", "Mounjaro", "Zepbound"], {
    message: "GLP-1 type is required",
  }),
  dose: z.coerce
    .number()
    .min(0.1, "Dose must be at least 0.1 mg")
    .max(50, "Dose must be less than 50 mg"),
});

export type Glp1Input = z.infer<typeof glp1Schema>;

// Server-side validation schema (for API)
const createGlp1Schema = z.object({
  type: z.enum(["Ozempic", "Wegovy", "Mounjaro", "Zepbound"]),
  dose: z.number().min(0.1).max(50),
  capturedDate: z.date(),
  profileId: z.string(),
});

type CreateGlp1Input = z.infer<typeof createGlp1Schema>;

export class Glp1Service {
  static async createGlp1Entry(data: CreateGlp1Input) {
    // Validate input
    const validatedData = createGlp1Schema.parse(data);

    // Check if profile exists
    const profile = await prisma.profile.findUnique({
      where: { id: validatedData.profileId },
    });

    if (!profile) {
      throw new Error("Profile not found");
    }

    // Create GLP-1 entry record
    return await prisma.glp1Entry.create({
      data: {
        type: validatedData.type,
        dose: validatedData.dose,
        capturedDate: validatedData.capturedDate,
        profileId: validatedData.profileId,
      },
    });
  }

  static async getGlp1EntriesByProfile(profileId: string) {
    return await prisma.glp1Entry.findMany({
      where: { profileId },
      orderBy: { capturedDate: "desc" },
    });
  }

  static async getGlp1EntriesByDateRange(
    profileId: string,
    startDate: Date,
    endDate: Date
  ) {
    return await prisma.glp1Entry.findMany({
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

  static async deleteGlp1Entry(id: string, profileId: string) {
    return await prisma.glp1Entry.delete({
      where: {
        id,
        profileId, // Ensure user can only delete their own entries
      },
    });
  }

  static async getLatestGlp1Entry(profileId: string) {
    return await prisma.glp1Entry.findFirst({
      where: { profileId },
      orderBy: { capturedDate: "desc" },
    });
  }
}