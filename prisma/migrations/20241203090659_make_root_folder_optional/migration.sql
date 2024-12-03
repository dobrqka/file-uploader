/*
  Warnings:

  - A unique constraint covering the columns `[name,parentId]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[rootFolderId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_userId_fkey";

-- DropIndex
DROP INDEX "File_name_key";

-- DropIndex
DROP INDEX "Folder_name_key";

-- DropIndex
DROP INDEX "Folder_name_userId_key";

-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "parentId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "rootFolderId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Folder_name_parentId_key" ON "Folder"("name", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "User_rootFolderId_key" ON "User"("rootFolderId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_rootFolderId_fkey" FOREIGN KEY ("rootFolderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
