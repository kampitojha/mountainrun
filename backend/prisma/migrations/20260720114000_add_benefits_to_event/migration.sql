-- Add benefits + stats fields to Event
ALTER TABLE "Event" ADD COLUMN "benefits" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "Event" ADD COLUMN "finishers" INTEGER;
ALTER TABLE "Event" ADD COLUMN "verifiedResults" INTEGER;
ALTER TABLE "Event" ADD COLUMN "cities" INTEGER;
ALTER TABLE "Event" ADD COLUMN "resultNote" TEXT;
