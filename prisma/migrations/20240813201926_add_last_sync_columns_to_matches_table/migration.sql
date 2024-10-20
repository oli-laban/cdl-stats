-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "last_bp_sync" TIMESTAMP(3),
ADD COLUMN     "last_cdl_sync" TIMESTAMP(3);
