/*
  Warnings:

  - You are about to drop the column `hp_hill_1_time` on the `player_results` table. All the data in the column will be lost.
  - You are about to drop the column `hp_hill_2_time` on the `player_results` table. All the data in the column will be lost.
  - You are about to drop the column `hp_hill_3_time` on the `player_results` table. All the data in the column will be lost.
  - You are about to drop the column `hp_hill_4_time` on the `player_results` table. All the data in the column will be lost.
  - You are about to drop the column `hp_hill_5_time` on the `player_results` table. All the data in the column will be lost.
  - You are about to drop the column `hp_hill_6_time` on the `player_results` table. All the data in the column will be lost.
  - You are about to drop the column `hp_hill_7_time` on the `player_results` table. All the data in the column will be lost.
  - You are about to drop the column `tier` on the `seasons` table. All the data in the column will be lost.
  - You are about to drop the column `tier` on the `tournaments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bp_id]` on the table `games` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RoundWinCondition" ADD VALUE 'PRE_PLANT_KILLS';
ALTER TYPE "RoundWinCondition" ADD VALUE 'POST_PLANT_KILLS';

-- AlterTable
ALTER TABLE "game_results" ADD COLUMN     "ctrl_attacking_rounds" INTEGER,
ADD COLUMN     "ctrl_ticks" INTEGER,
ADD COLUMN     "hp_hill_10_score" INTEGER,
ADD COLUMN     "hp_hill_11_score" INTEGER,
ADD COLUMN     "hp_hill_12_score" INTEGER,
ADD COLUMN     "hp_hill_13_score" INTEGER,
ADD COLUMN     "hp_hill_14_score" INTEGER,
ADD COLUMN     "hp_hill_15_score" INTEGER,
ADD COLUMN     "hp_hill_1_score" INTEGER,
ADD COLUMN     "hp_hill_2_score" INTEGER,
ADD COLUMN     "hp_hill_3_score" INTEGER,
ADD COLUMN     "hp_hill_4_score" INTEGER,
ADD COLUMN     "hp_hill_5_score" INTEGER,
ADD COLUMN     "hp_hill_6_score" INTEGER,
ADD COLUMN     "hp_hill_7_score" INTEGER,
ADD COLUMN     "hp_hill_8_score" INTEGER,
ADD COLUMN     "hp_hill_9_score" INTEGER;

-- AlterTable
ALTER TABLE "games" ADD COLUMN     "bp_id" TEXT,
ADD COLUMN     "gametime" INTEGER;

-- AlterTable
ALTER TABLE "player_results" DROP COLUMN "hp_hill_1_time",
DROP COLUMN "hp_hill_2_time",
DROP COLUMN "hp_hill_3_time",
DROP COLUMN "hp_hill_4_time",
DROP COLUMN "hp_hill_5_time",
DROP COLUMN "hp_hill_6_time",
DROP COLUMN "hp_hill_7_time",
ADD COLUMN     "first_deaths" INTEGER,
ADD COLUMN     "snd_1v1_wins" INTEGER,
ADD COLUMN     "snd_1v2_wins" INTEGER,
ADD COLUMN     "snd_1v3_wins" INTEGER,
ADD COLUMN     "snd_1v4_wins" INTEGER,
ADD COLUMN     "snd_snipes" INTEGER;

-- AlterTable
ALTER TABLE "seasons" DROP COLUMN "tier";

-- AlterTable
ALTER TABLE "tournaments" DROP COLUMN "tier";

-- DropEnum
DROP TYPE "Tier";

-- CreateIndex
CREATE UNIQUE INDEX "games_bp_id_key" ON "games"("bp_id");
