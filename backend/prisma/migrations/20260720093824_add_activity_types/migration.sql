-- Add activityTypes to Event
ALTER TABLE "Event" ADD COLUMN "activityTypes" TEXT[] NOT NULL DEFAULT '{"running"}';
-- Add activityType to Registration
ALTER TABLE "Registration" ADD COLUMN "activityType" TEXT NOT NULL DEFAULT 'running';
