-- Add referral & submitted-by fields

-- User referral code
ALTER TABLE "User" ADD COLUMN "referralCode" TEXT;
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- Referral table
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "refereeId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rewardGiven" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "referrals_refereeId_key" ON "referrals"("refereeId");
CREATE INDEX "referrals_referrerId_idx" ON "referrals"("referrerId");
CREATE INDEX "referrals_code_idx" ON "referrals"("code");
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON UPDATE CASCADE ON DELETE RESTRICT;

-- SiteMedia submittedBy
ALTER TABLE "SiteMedia" ADD COLUMN "submittedBy" TEXT;

-- Event benefits default cleanup
ALTER TABLE "Event" ALTER COLUMN "benefits" DROP DEFAULT;
