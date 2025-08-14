import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Client-side validation schema (for forms)
export const bloodSugarSchema = z.object({
  level: z.number().min(20, "Blood sugar level must be at least 20 mg/dL").max(600, "Blood sugar level must be at most 600 mg/dL"),
  measurementType: z.enum(["fasting", "before_meal", "after_meal", "bedtime"], {
    message: "Please select a valid measurement type",
  }),
});

export type BloodSugarInput = z.infer<typeof bloodSugarSchema>;

// Server-side validation schema (for API)
const createBloodSugarSchema = z.object({
  level: z.number().min(20).max(600),
  measurementType: z.enum(["fasting", "before_meal", "after_meal", "bedtime"]),
  profileId: z.string().min(1, "Profile ID is required"),
  capturedDate: z.date().optional(), // Optional, defaults to current date
});

export type CreateBloodSugarData = z.infer<typeof createBloodSugarSchema>;

export class BloodSugarService {
  static async createBloodSugar(data: CreateBloodSugarData) {
    const validatedData = createBloodSugarSchema.parse(data);
    
    return await prisma.bloodSugar.create({
      data: {
        level: validatedData.level,
        measurementType: validatedData.measurementType,
        profileId: validatedData.profileId,
        capturedDate: validatedData.capturedDate || new Date(),
      },
    });
  }

  static async getBloodSugarsByProfile(profileId: string, limit = 10) {
    return await prisma.bloodSugar.findMany({
      where: { profileId },
      orderBy: { capturedDate: "desc" },
      take: limit,
    });
  }

  static async getBloodSugarsByDateRange(
    profileId: string,
    startDate: Date,
    endDate: Date
  ) {
    return await prisma.bloodSugar.findMany({
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

  static async getBloodSugarById(id: string) {
    return await prisma.bloodSugar.findUnique({
      where: { id },
    });
  }

  static async updateBloodSugar(id: string, data: Partial<CreateBloodSugarData>) {
    const updateData: any = {};
    
    if (data.level !== undefined) updateData.level = data.level;
    if (data.measurementType !== undefined) updateData.measurementType = data.measurementType;
    if (data.capturedDate !== undefined) updateData.capturedDate = data.capturedDate;
    
    return await prisma.bloodSugar.update({
      where: { id },
      data: updateData,
    });
  }

  static async deleteBloodSugar(id: string) {
    return await prisma.bloodSugar.delete({
      where: { id },
    });
  }

  static async getLatestBloodSugar(profileId: string) {
    return await prisma.bloodSugar.findFirst({
      where: { profileId },
      orderBy: { capturedDate: "desc" },
    });
  }

  static async getBloodSugarStats(profileId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const bloodSugars = await prisma.bloodSugar.findMany({
      where: {
        profileId,
        capturedDate: {
          gte: startDate,
        },
      },
      orderBy: { capturedDate: "desc" },
    });

    if (bloodSugars.length === 0) {
      return {
        average: 0,
        min: 0,
        max: 0,
        count: 0,
        latest: null,
      };
    }

    const levels = bloodSugars.map((bs: any) => bs.level);
    const average = levels.reduce((sum: number, level: number) => sum + level, 0) / levels.length;
    const min = Math.min(...levels);
    const max = Math.max(...levels);

    return {
      average: Math.round(average * 10) / 10,
      min,
      max,
      count: bloodSugars.length,
      latest: bloodSugars[0],
    };
  }
}