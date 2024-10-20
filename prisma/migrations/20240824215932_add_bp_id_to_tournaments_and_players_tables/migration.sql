/*
  Warnings:

  - A unique constraint covering the columns `[bp_id]` on the table `players` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cdl_id]` on the table `tournaments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bp_id]` on the table `tournaments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AddedVia" AS ENUM ('CDL', 'BP');

-- AlterTable
ALTER TABLE "players" ADD COLUMN     "bp_id" INTEGER;

-- AlterTable
ALTER TABLE "tournaments" ADD COLUMN     "bp_id" INTEGER,
ADD COLUMN     "cdl_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "players_bp_id_key" ON "players"("bp_id");

-- CreateIndex
CREATE UNIQUE INDEX "tournaments_cdl_id_key" ON "tournaments"("cdl_id");

-- CreateIndex
CREATE UNIQUE INDEX "tournaments_bp_id_key" ON "tournaments"("bp_id");
