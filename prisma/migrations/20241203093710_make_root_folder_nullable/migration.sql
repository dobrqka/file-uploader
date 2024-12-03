-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_rootFolderId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "rootFolderId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_rootFolderId_fkey" FOREIGN KEY ("rootFolderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
