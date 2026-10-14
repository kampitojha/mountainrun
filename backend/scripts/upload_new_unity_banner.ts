import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function main() {
  const posterPath = "C:\\Users\\91991\\.gemini\\antigravity-ide\\brain\\a732e247-be07-45bb-a2ed-ff404576d5f1\\unity_dual_star_poster_1791289230637.jpg";

  if (!fs.existsSync(posterPath)) {
    throw new Error(`Poster file does not exist at: ${posterPath}`);
  }

  console.log("Uploading National Unity Day Star Medal Poster to Cloudinary (mountainrun/banners)...");
  const uploadResult = await cloudinary.uploader.upload(posterPath, {
    folder: "mountainrun/banners",
    public_id: "national_unity_day_2026_cinematic_poster",
    overwrite: true,
    invalidate: true
  });

  const bannerImageUrl = uploadResult.secure_url;
  console.log("✅ Successfully uploaded to Cloudinary!");
  console.log("Banner URL:", bannerImageUrl);

  const slug = "national-unity-day-2026";
  console.log(`Updating Event in database for slug '${slug}'...`);

  const updatedEvent = await prisma.event.update({
    where: { slug },
    data: {
      bannerImageUrl
    }
  });

  console.log("✅ Database event updated successfully!");
  console.log("Event Title:", updatedEvent.title);
  console.log("Updated bannerImageUrl:", updatedEvent.bannerImageUrl);
}

main()
  .catch((err) => {
    console.error("❌ Failed to upload banner:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
