/*
  Warnings:

  - You are about to drop the `game_players` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "game_players" DROP CONSTRAINT "game_players_game_id_fkey";

-- DropForeignKey
ALTER TABLE "game_players" DROP CONSTRAINT "game_players_winner_id_fkey";

-- DropTable
DROP TABLE "game_players";

-- CreateTable
CREATE TABLE "player_results" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "match_id" INTEGER NOT NULL,
    "game_id" INTEGER,
    "winner_id" INTEGER NOT NULL,
    "kills" INTEGER,
    "deaths" INTEGER,
    "assists" INTEGER,
    "damage" INTEGER,
    "team_damage" INTEGER,
    "damage_taken" INTEGER,
    "score" INTEGER,
    "kill_death_ratio" TEXT,
    "untraded_kills" INTEGER,
    "traded_kills" INTEGER,
    "untraded_deaths" INTEGER,
    "traded_deaths" INTEGER,
    "first_bloods" INTEGER,
    "victim_fov_kills" INTEGER,
    "highest_streak" INTEGER,
    "highest_multikill" INTEGER,
    "tacticals_used" INTEGER,
    "lethals_used" INTEGER,
    "shots_fired" INTEGER,
    "shots_hit" INTEGER,
    "headshots" INTEGER,
    "longshots" INTEGER,
    "wallbangs" INTEGER,
    "average_speed" DOUBLE PRECISION,
    "percent_time_moving" INTEGER,
    "distance_traveled" DOUBLE PRECISION,
    "ctrl_captures" INTEGER,
    "ctrl_ticks" INTEGER,
    "snd_aces" INTEGER,
    "snd_plants" INTEGER,
    "snd_defuses" INTEGER,
    "snd_ninja_defuses" INTEGER,
    "snd_defuser_kills" INTEGER,
    "snd_planter_kills" INTEGER,
    "hp_hill_time" INTEGER,
    "hp_hill_1_time" INTEGER,
    "hp_hill_2_time" INTEGER,
    "hp_hill_3_time" INTEGER,
    "hp_hill_4_time" INTEGER,
    "hp_hill_5_time" INTEGER,
    "hp_hill_6_time" INTEGER,
    "hp_hill_7_time" INTEGER,
    "hp_contest_time" INTEGER,

    CONSTRAINT "player_results_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "player_results" ADD CONSTRAINT "player_results_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_results" ADD CONSTRAINT "player_results_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_results" ADD CONSTRAINT "player_results_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
