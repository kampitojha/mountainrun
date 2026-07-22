-- Add couponCode and showCouponOnCard to Event
ALTER TABLE "Event" ADD COLUMN "couponCode" TEXT;
ALTER TABLE "Event" ADD COLUMN "showCouponOnCard" BOOLEAN NOT NULL DEFAULT false;
