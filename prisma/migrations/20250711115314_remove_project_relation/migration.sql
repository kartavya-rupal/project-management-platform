/*
  Warnings:

  - You are about to drop the column `projectId` on the `OrgPost` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrgPost" DROP CONSTRAINT "OrgPost_projectId_fkey";

-- AlterTable
ALTER TABLE "OrgPost" DROP COLUMN "projectId";
