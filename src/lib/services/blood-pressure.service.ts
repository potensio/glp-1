import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Blood pressure status types
export type BloodPressureStatus = "low" | "normal" | "high";

// Helper functions for blood pressure classification
export function getSystolicStatus(systolic: number): BloodPressureStatus {
  if (systolic < 100) return "low";
  if (systolic > 140) return "high";
  return "normal";
}

export function getDiastolicStatus(diastolic: number): BloodPressureStatus {
  if (diastolic < 60) return "low";
  if (diastolic > 90) return "high";
  return "normal";
}

export function getOverallStatus(systolic: number, diastolic: number): BloodPressureStatus {
  const systolicStatus = getSystolicStatus(systolic);
  const diastolicStatus = getDiastolicStatus(diastolic);
  
  // If either is high, overall is high
  if (systolicStatus === "high" || diastolicStatus === "high") return "high";
  // If either is low, overall is low
  if (systolicStatus === "low" || diastolicStatus === "low") return "low";
  // Both are normal
  return "normal";
}

// Client-side validation schema (for forms)
export const bloodPressureSchema = z.object({
  systolic: z.coerce
    .number()
    .min(50, "Systolic must be at least 50")
    .max(250, "Systolic must be less than 250"),
  diastolic: z.coerce
    .number()
    .min(30, "Diastolic must be at least 30")
    .max(150, "Diastolic must be less than 150"),
});

export type BloodPressureInput = z.infer<typeof bloodPressureSchema>;

// Server-side validation schema (for API)
const createBloodPressureSchema = z.object({
  systolic: z.number().min(50).max(250),
  diastolic: z.number().min(30).max(150),
  capturedDate: z.string().datetime().optional(),
  profileId: z.string(),
});

type CreateBloodPressureInput = z.infer<typeof createBloodPressureSchema>;

export class BloodPressureService {
  static async createBloodPressure(data: CreateBloodPressureInput) {
    // Validate input
    const validatedData = createBloodPressureSchema.parse(data);

    // Check if profile exists
    const profile = await prisma.profile.findUnique({
      where: { id: validatedData.profileId },
    });

    if (!profile) {
      throw new Error("Profile not found");
    }

    // Create blood pressure record
    return await prisma.bloodPressure.create({
      data: {
        ...validatedData,
        capturedDate: validatedData.capturedDate 
          ? new Date(validatedData.capturedDate)
          : new Date(),
      },
    });
  }

  static async getBloodPressuresByProfile(profileId: string) {
    return await prisma.bloodPressure.findMany({
      where: { profileId },
      orderBy: { capturedDate: "desc" },
    });
  }

  static async getLatestBloodPressure(profileId: string) {
    return await prisma.bloodPressure.findFirst({
      where: { profileId },
      orderBy: { capturedDate: "desc" },
    });
  }

  static async getBloodPressuresByDateRange(
    profileId: string,
    startDate: Date,
    endDate: Date
  ) {
    return await prisma.bloodPressure.findMany({
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

  static async deleteBloodPressure(id: string, profileId: string) {
    // Ensure the blood pressure belongs to the profile
    const bloodPressure = await prisma.bloodPressure.findFirst({
      where: { id, profileId },
    });

    if (!bloodPressure) {
      throw new Error("Blood pressure record not found");
    }

    return await prisma.bloodPressure.delete({
      where: { id },
    });
  }
}