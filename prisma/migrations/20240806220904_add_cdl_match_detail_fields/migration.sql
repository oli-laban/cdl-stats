/*
  Warnings:

  - A unique constraint covering the columns `[cdl_id]` on the table `games` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "game_players" ADD COLUMN     "assists" INTEGER,
ADD COLUMN     "average_speed" DOUBLE PRECISION,
ADD COLUMN     "ctrl_captures" INTEGER,
ADD COLUMN     "ctrl_ticks" INTEGER,
ADD COLUMN     "damage" INTEGER,
ADD COLUMN     "damage_taken" INTEGER,
ADD COLUMN     "deaths" INTEGER,
ADD COLUMN     "distance_traveled" DOUBLE PRECISION,
ADD COLUMN     "first_bloods" INTEGER,
ADD COLUMN     "headshots" INTEGER,
ADD COLUMN     "highest_multikill" INTEGER,
ADD COLUMN     "highest_streak" INTEGER,
ADD COLUMN     "hp_hill_1_time" INTEGER,
ADD COLUMN     "hp_hill_2_time" INTEGER,
ADD COLUMN     "hp_hill_3_time" INTEGER,
ADD COLUMN     "hp_hill_4_time" INTEGER,
ADD COLUMN     "hp_hill_5_time" INTEGER,
ADD COLUMN     "hp_hill_6_time" INTEGER,
ADD COLUMN     "hp_hill_7_time" INTEGER,
ADD COLUMN     "hp_hill_time" INTEGER,
ADD COLUMN     "kill_death_ratio" TEXT,
ADD COLUMN     "kills" INTEGER,
ADD COLUMN     "lethals_used" INTEGER,
ADD COLUMN     "longshots" INTEGER,
ADD COLUMN     "percent_time_moving" INTEGER,
ADD COLUMN     "score" INTEGER,
ADD COLUMN     "shots_fired" INTEGER,
ADD COLUMN     "shots_hit" INTEGER,
ADD COLUMN     "snd_aces" INTEGER,
ADD COLUMN     "snd_defuser_kills" INTEGER,
ADD COLUMN     "snd_planter_kills" INTEGER,
ADD COLUMN     "tacticals_used" INTEGER,
ADD COLUMN     "team_damage" INTEGER,
ADD COLUMN     "traded_deaths" INTEGER,
ADD COLUMN     "traded_kills" INTEGER,
ADD COLUMN     "untraded_deaths" INTEGER,
ADD COLUMN     "untraded_kills" INTEGER,
ADD COLUMN     "victim_fov_kills" INTEGER,
ADD COLUMN     "wallbangs" INTEGER;

-- AlterTable
ALTER TABLE "games" ADD COLUMN     "cdl_id" INTEGER,
ADD COLUMN     "map_id" INTEGER;

-- CreateTable
CREATE TABLE "releases" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,

    CONSTRAINT "releases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Map" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "release_id" INTEGER NOT NULL,

    CONSTRAINT "Map_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "games_cdl_id_key" ON "games"("cdl_id");

-- AddForeignKey
ALTER TABLE "Map" ADD CONSTRAINT "Map_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "releases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_map_id_fkey" FOREIGN KEY ("map_id") REFERENCES "Map"("id") ON DELETE SET NULL ON UPDATE CASCADE;
