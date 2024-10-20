/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `releases` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[short_name]` on the table `releases` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[abbreviation]` on the table `releases` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "releases_name_key" ON "releases"("name");

-- CreateIndex
CREATE UNIQUE INDEX "releases_short_name_key" ON "releases"("short_name");

-- CreateIndex
CREATE UNIQUE INDEX "releases_abbreviation_key" ON "releases"("abbreviation");
