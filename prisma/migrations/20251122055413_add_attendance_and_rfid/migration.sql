/*
  Warnings:

  - A unique constraint covering the columns `[rfidTag]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('CHECK_IN', 'CHECK_OUT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "rfidTag" TEXT;

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "rfidTag" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'CHECK_IN',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Attendance_organisationId_userId_timestamp_idx" ON "Attendance"("organisationId", "userId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "User_rfidTag_key" ON "User"("rfidTag");

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
