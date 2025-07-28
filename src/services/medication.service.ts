import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Dosage unit enum for validation
export const dosageUnitSchema = z.enum([
  "MG",
  "G",
  "ML",
  "L",
  "IU",
  "MCG",
  "UNITS",
]);
export type DosageUnit = z.infer<typeof dosageUnitSchema>;

// Client-side validation schema (for forms)
export const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage: z.coerce.number().min(0.01, "Dosage must be greater than 0"),
  dosageUnit: dosageUnitSchema.default("MG"),
  description: z.string().optional(),
  prescribingDoctor: z.string().optional(),
  status: z.enum(["active", "paused", "inactive"]).default("active"),
  startDate: z.string().min(1, "Start date is required"),
  repeatEvery: z.coerce.number().min(1, "Repeat frequency must be at least 1"),
  repeatUnit: z.enum(["Day(s)", "Week(s)"]).default("Day(s)"),
  enableReminders: z.boolean().default(false),
});

export type MedicationInput = z.infer<typeof medicationSchema>;

// Server-side validation schema (for API)
const createMedicationSchema = z.object({
  name: z.string().min(1),
  dosage: z.number().min(0.01),
  dosageUnit: z
    .enum(["MG", "G", "ML", "L", "IU", "MCG", "UNITS"])
    .default("MG"),
  description: z.string().optional(),
  prescribingDoctor: z.string().optional(),
  status: z.string().default("active"),
  startDate: z.string(),
  repeatEvery: z.number().min(1),
  repeatUnit: z.string(),
  enableReminders: z.boolean(),
  profileId: z.string(),
});

type CreateMedicationInput = z.infer<typeof createMedicationSchema>;

export class MedicationService {
  static async createMedication(data: CreateMedicationInput) {
    // Validate input
    const validatedData = createMedicationSchema.parse(data);

    // Check if profile exists
    const profile = await prisma.profile.findUnique({
      where: { id: validatedData.profileId },
    });

    if (!profile) {
      throw new Error("Profile not found");
    }

    // Create medication record
    return await prisma.medication.create({
      data: {
        ...validatedData,
        startDate: new Date(validatedData.startDate),
      },
    });
  }

  static async getMedicationsByProfile(profileId: string) {
    return await prisma.medication.findMany({
      where: { profileId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async updateMedication(
    id: string,
    profileId: string,
    data: Partial<CreateMedicationInput>
  ) {
    // Ensure the medication belongs to the profile
    const medication = await prisma.medication.findFirst({
      where: { id, profileId },
    });

    if (!medication) {
      throw new Error("Medication not found");
    }

    return await prisma.medication.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
      },
    });
  }

  static async deleteMedication(id: string, profileId: string) {
    // Ensure the medication belongs to the profile
    const medication = await prisma.medication.findFirst({
      where: { id, profileId },
    });

    if (!medication) {
      throw new Error("Medication not found");
    }

    return await prisma.medication.delete({
      where: { id },
    });
  }
}
