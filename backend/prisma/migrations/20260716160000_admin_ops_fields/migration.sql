-- AlterTable
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "paymentRequired" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "maxCapacity" INTEGER;

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN IF NOT EXISTS "adminNote" TEXT;

-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Registration_status_idx" ON "Registration"("status");
CREATE INDEX IF NOT EXISTS "Registration_registeredAt_idx" ON "Registration"("registeredAt");

-- CreateTable
CREATE TABLE IF NOT EXISTS "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "actorClerkId" TEXT,
    "actorEmail" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "AdminAuditLog_entityType_entityId_idx" ON "AdminAuditLog"("entityType", "entityId");
