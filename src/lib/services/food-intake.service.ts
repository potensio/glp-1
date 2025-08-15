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

// Server-side validation schema (for API)
const createFoodIntakeSchema = z.object({
  mealType: z.string().min(1),
  food: z.string().min(1),
  calories: z.number().min(1),
  capturedDate: z.date(),
  profileId: z.string(),
});

type CreateFoodIntakeInput = z.infer<typeof createFoodIntakeSchema>;

export class FoodIntakeService {
  static async createFoodIntake(data: CreateFoodIntakeInput) {
    // Validate input
    const validatedData = createFoodIntakeSchema.parse(data);

    // Check if profile exists
    const profile = await prisma.profile.findUnique({
      where: { id: validatedData.profileId },
    });

    if (!profile) {
      throw new Error("Profile not found");
    }

    // Create food intake record
    return await prisma.foodIntake.create({
      data: {
        mealType: validatedData.mealType,
        food: validatedData.food,
        calories: validatedData.calories,
        capturedDate: validatedData.capturedDate,
        profileId: validatedData.profileId,
      },
    });
  }

  static async getFoodIntakesByProfile(profileId: string) {
    return await prisma.foodIntake.findMany({
      where: { profileId },
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

  static async deleteFoodIntake(id: string, profileId: string) {
    // Ensure the food intake belongs to the profile
    const foodIntake = await prisma.foodIntake.findFirst({
      where: { id, profileId },
    });

    if (!foodIntake) {
      throw new Error("Food intake record not found");
    }

    return await prisma.foodIntake.delete({
      where: { id },
    });
  }
}
