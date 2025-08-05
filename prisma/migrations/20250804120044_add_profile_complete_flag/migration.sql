/*
  Warnings:

  - You are about to drop the `magic_links` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `password` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "magic_links" DROP CONSTRAINT "magic_links_userId_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isProfileComplete" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "password" SET NOT NULL;

-- DropTable
DROP TABLE "magic_links";
