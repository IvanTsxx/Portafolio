/*
  Warnings:

  - You are about to drop the `_PostToCategory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categoryId` to the `posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "categoryId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_PostToCategory";

-- CreateIndex
CREATE INDEX "posts_categoryId_idx" ON "posts"("categoryId");
