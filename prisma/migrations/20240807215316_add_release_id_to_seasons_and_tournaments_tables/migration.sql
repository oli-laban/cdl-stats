/*
  Warnings:

  - Added the required column `release_id` to the `seasons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "seasons" ADD COLUMN     "release_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "tournaments" ADD COLUMN     "release_id" INTEGER;

-- AddForeignKey
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "releases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "releases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
