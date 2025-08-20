/*
  Warnings:

  - Added the required column `dateCode` to the `food_intakes` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Add the column as nullable
ALTER TABLE "food_intakes" ADD COLUMN "dateCode" TEXT;

-- Step 2: Populate existing records with dateCode based on capturedDate
-- Format: MMDDYYYY (e.g., 08202025 for August 20, 2025)
UPDATE "food_intakes" 
SET "dateCode" = LPAD(EXTRACT(MONTH FROM "capturedDate")::TEXT, 2, '0') || 
                 LPAD(EXTRACT(DAY FROM "capturedDate")::TEXT, 2, '0') || 
                 EXTRACT(YEAR FROM "capturedDate")::TEXT
WHERE "dateCode" IS NULL;

-- Step 3: Make the column required
ALTER TABLE "food_intakes" ALTER COLUMN "dateCode" SET NOT NULL;
