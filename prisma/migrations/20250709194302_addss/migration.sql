/*
  Warnings:

  - You are about to drop the `Query` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Song` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Query" DROP CONSTRAINT "Query_resultId_fkey";

-- DropForeignKey
ALTER TABLE "Query" DROP CONSTRAINT "Query_userId_fkey";

-- DropTable
DROP TABLE "Query";

-- DropTable
DROP TABLE "Song";

-- CreateTable
CREATE TABLE "BlockedUser" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "blockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockedUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlockedUser_telegramId_key" ON "BlockedUser"("telegramId");
