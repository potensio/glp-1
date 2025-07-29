import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Zod schemas for validation
export const createJournalSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  capturedDate: z.date(),
  profileId: z.string().min(1, "Profile ID is required"),
});

export const updateJournalSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  capturedDate: z.date().optional(),
});

export type CreateJournalData = z.infer<typeof createJournalSchema>;
export type UpdateJournalData = z.infer<typeof updateJournalSchema>;

// Service functions
export async function createJournal(data: CreateJournalData) {
  const validatedData = createJournalSchema.parse(data);
  
  return await prisma.journal.create({
    data: validatedData,
  });
}

export async function getJournalsByProfileId(profileId: string) {
  return await prisma.journal.findMany({
    where: { profileId },
    orderBy: { capturedDate: "desc" },
  });
}

export async function getJournalById(id: string) {
  return await prisma.journal.findUnique({
    where: { id },
  });
}

export async function updateJournal(id: string, data: UpdateJournalData) {
  const validatedData = updateJournalSchema.parse(data);
  
  return await prisma.journal.update({
    where: { id },
    data: validatedData,
  });
}

export async function deleteJournal(id: string) {
  return await prisma.journal.delete({
    where: { id },
  });
}

export async function getJournalsByDateRange(
  profileId: string,
  startDate: Date,
  endDate: Date
) {
  return await prisma.journal.findMany({
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