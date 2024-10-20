/*
  Warnings:

  - You are about to drop the column `winner_id` on the `player_results` table. All the data in the column will be lost.
  - Added the required column `player_id` to the `player_results` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "player_results" DROP CONSTRAINT "player_results_winner_id_fkey";

-- AlterTable
ALTER TABLE "player_results" DROP COLUMN "winner_id",
ADD COLUMN     "player_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "player_results" ADD CONSTRAINT "player_results_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
