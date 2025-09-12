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
  // Enhanced nutrition fields
  protein: z.coerce.number().min(0).max(1000).optional(),
  carbs: z.coerce.number().min(0).max(1000).optional(),
  fat: z.coerce.number().min(0).max(1000).optional(),
  fiber: z.coerce.number().min(0).max(200).optional(),
  // Portion tracking
  quantity: z.coerce.number().min(0.1).max(100).optional(),
  unit: z.string().optional(),
  capturedDate: z.string().optional(),
});

export type FoodIntakeInput = z.infer<typeof foodIntakeSchema>;

// Server-side creation schema
export const createFoodIntakeSchema = z.object({
  profileId: z.string(),
  mealType: z.string().min(1),
  food: z.string().min(1),
  calories: z.number().min(1).max(10000),
  // Enhanced nutrition fields
  protein: z.number().min(0).max(1000).optional(),
  carbs: z.number().min(0).max(1000).optional(),
  fat: z.number().min(0).max(1000).optional(),
  fiber: z.number().min(0).max(200).optional(),
  // Portion tracking
  quantity: z.number().min(0.1).max(100).optional(),
  unit: z.string().optional(),
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
