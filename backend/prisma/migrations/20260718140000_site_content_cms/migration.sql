-- CreateTable
CREATE TABLE "SiteMedia" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Community',
    "location" TEXT,
    "eventLabel" TEXT,
    "dateLabel" TEXT,
    "meta" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "showInGallery" BOOLEAN NOT NULL DEFAULT true,
    "showOnHomeMoments" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteTestimonial" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "city" TEXT,
    "quote" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "showOnHome" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteTestimonial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SiteMedia_published_showInGallery_idx" ON "SiteMedia"("published", "showInGallery");

-- CreateIndex
CREATE INDEX "SiteMedia_published_showOnHomeMoments_idx" ON "SiteMedia"("published", "showOnHomeMoments");

-- CreateIndex
CREATE INDEX "SiteMedia_sortOrder_idx" ON "SiteMedia"("sortOrder");

-- CreateIndex
CREATE INDEX "SiteTestimonial_published_showOnHome_idx" ON "SiteTestimonial"("published", "showOnHome");

-- CreateIndex
CREATE INDEX "SiteTestimonial_sortOrder_idx" ON "SiteTestimonial"("sortOrder");
