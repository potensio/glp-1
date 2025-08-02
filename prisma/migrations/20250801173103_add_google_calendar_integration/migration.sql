/*
  Warnings:

  - You are about to drop the column `calendarId` on the `calendar_events` table. All the data in the column will be lost.
  - You are about to drop the column `lastSyncAt` on the `calendar_events` table. All the data in the column will be lost.
  - You are about to drop the column `recurrence` on the `calendar_events` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `calendar_events` table. All the data in the column will be lost.
  - You are about to drop the column `visibility` on the `calendar_events` table. All the data in the column will be lost.
  - The `attendees` column on the `calendar_events` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `scope` on the `google_integrations` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "calendar_events_googleEventId_idx";

-- DropIndex
DROP INDEX "calendar_events_googleIntegrationId_idx";

-- DropIndex
DROP INDEX "calendar_events_startTime_idx";

-- AlterTable
ALTER TABLE "calendar_events" DROP COLUMN "calendarId",
DROP COLUMN "lastSyncAt",
DROP COLUMN "recurrence",
DROP COLUMN "status",
DROP COLUMN "visibility",
DROP COLUMN "attendees",
ADD COLUMN     "attendees" TEXT[];

-- AlterTable
ALTER TABLE "google_integrations" DROP COLUMN "scope",
ADD COLUMN     "calendarId" TEXT;
