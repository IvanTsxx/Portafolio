/*
  Warnings:

  - You are about to drop the column `url` on the `projects` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "projects" DROP COLUMN "url",
ADD COLUMN     "demoUrl" TEXT,
ADD COLUMN     "githubUrl" TEXT;
