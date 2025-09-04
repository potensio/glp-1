import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Client-side validation schema (for forms)
export const foodIntakeSchema = z.object({
  mealType: z.string().min(1, "Meal type is required"),
  food: z.string().min(1, "Food description is required"),
  calories: z.coerce
    .number()
    .min(1, "Calories must be at least 1")
    .max(10000, "Calories must be less than 10,000"),
  capturedDate: z.string().optional(),
});

export type FoodIntakeInput = z.infer<typeof foodIntakeSchema>;

// Server-side creation schema
export const createFoodIntakeSchema = z.object({
  profileId: z.string(),
  mealType: z.string().min(1),
  food: z.string().min(1),
  calories: z.number().min(1).max(10000),
  capturedDate: z.date(),
  dateCode: z.string(),
});

export type CreateFoodIntakeInput = z.infer<typeof createFoodIntakeSchema>;

// Helper function to generate date code in DDMMYYYY format
// This is used as a constraint to find existing food intake entries
function generateDateCode(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString();
  return `${day}${month}${year}`;
}

// Helper function to generate date code from string
function generateDateCodeFromString(dateString: string): string {
  const date = new Date(dateString);
  return generateDateCode(date);
}

export class FoodIntakeService {
  // Create a single food intake entry
  static async createFoodIntake(data: CreateFoodIntakeInput) {
    const validatedData = createFoodIntakeSchema.parse(data);

    return await prisma.foodIntake.create({
      data: validatedData,
    });
  }

  // Clear all food intake entries for a specific date (using dateCode)
  static async clearFoodIntakesByDateCode(profileId: string, dateCode: string) {
    return await prisma.foodIntake.deleteMany({
      where: {
        profileId,
        dateCode,
      },
    });
  }

  // Create multiple food intake entries with clear-before-submit strategy
  static async createMultipleFoodIntakesWithClear(
    profileId: string,
    entries: Array<{
      mealType: string;
      food: string;
      calories: number;
      capturedDate: Date;
    }>
  ) {
    if (entries.length === 0) {
      throw new Error("No entries provided");
    }

    // Generate dateCode in DDMMYYYY format from the first entry (all entries should be for the same date)
    // This dateCode is used as constraint to find and clear existing food intake entries
    const dateCode = generateDateCode(entries[0].capturedDate);

    // Use transaction to ensure atomicity
    return await prisma.$transaction(async (tx) => {
      // First, clear all existing entries for this date using dateCode as constraint
      await tx.foodIntake.deleteMany({
        where: {
          profileId,
          dateCode, // DDMMYYYY format constraint
        },
      });

      // Then, create all new entries
      const createdEntries = [];
      for (const entry of entries) {
        const validatedData = createFoodIntakeSchema.parse({
          profileId,
          mealType: entry.mealType,
          food: entry.food,
          calories: entry.calories,
          capturedDate: entry.capturedDate,
          dateCode,
        });

        const created = await tx.foodIntake.create({
          data: validatedData,
        });
        createdEntries.push(created);
      }

      return createdEntries;
    });
  }

  static async getFoodIntakesByProfile(profileId: string) {
    return await prisma.foodIntake.findMany({
      where: { profileId },
      orderBy: { capturedDate: "desc" },
    });
  }

  // Get food intake entries using dateCode (DDMMYYYY format) as constraint
  static async getFoodIntakesByDateCode(profileId: string, dateCode: string) {
    return await prisma.foodIntake.findMany({
      where: {
        profileId,
        dateCode, // DDMMYYYY format constraint for timezone-independent queries
      },
      orderBy: { capturedDate: "desc" },
    });
  }

  static async getFoodIntakesByDateRange(
    profileId: string,
    startDate: Date,
    endDate: Date
  ) {
    return await prisma.foodIntake.findMany({
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

  // Deletion methods removed
}
