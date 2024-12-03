/*
  Warnings:

  - Made the column `rootFolderId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_rootFolderId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "rootFolderId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_rootFolderId_fkey" FOREIGN KEY ("rootFolderId") REFERENCES "Folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
