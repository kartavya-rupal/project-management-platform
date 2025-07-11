/*
  Warnings:

  - Added the required column `orgId` to the `OrgPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrgPost" ADD COLUMN     "orgId" TEXT NOT NULL;
