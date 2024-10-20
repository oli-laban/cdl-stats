/*
  Warnings:

  - Added the required column `team_id` to the `player_results` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "player_results" ADD COLUMN     "team_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "player_results" ADD CONSTRAINT "player_results_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
