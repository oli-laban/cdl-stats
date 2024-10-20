/*
  Warnings:

  - You are about to drop the column `location` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `nameFirst` on the `teams` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "teams_cdl_id_key";

-- AlterTable
ALTER TABLE "teams" DROP COLUMN "location",
DROP COLUMN "nameFirst";
