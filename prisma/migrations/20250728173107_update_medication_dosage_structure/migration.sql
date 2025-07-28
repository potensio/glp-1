/*
  Warnings:

  - Changed the type of `dosage` on the `medications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DosageUnit" AS ENUM ('MG', 'G', 'ML', 'L', 'IU', 'MCG', 'UNITS');

-- Add the new dosageUnit column with default value
ALTER TABLE "medications" ADD COLUMN "dosageUnit" "DosageUnit" NOT NULL DEFAULT 'MG';

-- Add a temporary column for the new dosage format
ALTER TABLE "medications" ADD COLUMN "dosage_new" DOUBLE PRECISION;

-- Extract numeric values from existing dosage strings and update dosageUnit based on the unit
UPDATE "medications" SET 
  "dosage_new" = CASE 
    WHEN "dosage" ~ '^[0-9]+(\.[0-9]+)?\s*mg$' THEN CAST(REGEXP_REPLACE("dosage", '[^0-9.]', '', 'g') AS DOUBLE PRECISION)
    WHEN "dosage" ~ '^[0-9]+(\.[0-9]+)?\s*g$' THEN CAST(REGEXP_REPLACE("dosage", '[^0-9.]', '', 'g') AS DOUBLE PRECISION)
    WHEN "dosage" ~ '^[0-9]+(\.[0-9]+)?\s*ml$' THEN CAST(REGEXP_REPLACE("dosage", '[^0-9.]', '', 'g') AS DOUBLE PRECISION)
    WHEN "dosage" ~ '^[0-9]+(\.[0-9]+)?\s*iu$' THEN CAST(REGEXP_REPLACE("dosage", '[^0-9.]', '', 'g') AS DOUBLE PRECISION)
    WHEN "dosage" ~ '^[0-9]+(\.[0-9]+)?\s*mcg$' THEN CAST(REGEXP_REPLACE("dosage", '[^0-9.]', '', 'g') AS DOUBLE PRECISION)
    ELSE CAST(REGEXP_REPLACE("dosage", '[^0-9.]', '', 'g') AS DOUBLE PRECISION)
  END,
  "dosageUnit" = CASE 
    WHEN LOWER("dosage") LIKE '%mg%' THEN 'MG'::"DosageUnit"
    WHEN LOWER("dosage") LIKE '%g%' AND NOT LOWER("dosage") LIKE '%mg%' AND NOT LOWER("dosage") LIKE '%mcg%' THEN 'G'::"DosageUnit"
    WHEN LOWER("dosage") LIKE '%ml%' THEN 'ML'::"DosageUnit"
    WHEN LOWER("dosage") LIKE '%l%' AND NOT LOWER("dosage") LIKE '%ml%' THEN 'L'::"DosageUnit"
    WHEN LOWER("dosage") LIKE '%iu%' THEN 'IU'::"DosageUnit"
    WHEN LOWER("dosage") LIKE '%mcg%' THEN 'MCG'::"DosageUnit"
    WHEN LOWER("dosage") LIKE '%unit%' THEN 'UNITS'::"DosageUnit"
    ELSE 'MG'::"DosageUnit"
  END;

-- Handle any null values by setting a default
UPDATE "medications" SET "dosage_new" = 1.0 WHERE "dosage_new" IS NULL;

-- Drop the old dosage column
ALTER TABLE "medications" DROP COLUMN "dosage";

-- Rename the new column to dosage
ALTER TABLE "medications" RENAME COLUMN "dosage_new" TO "dosage";

-- Add NOT NULL constraint to the new dosage column
ALTER TABLE "medications" ALTER COLUMN "dosage" SET NOT NULL;
