import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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
  try {
    const newImagePath = "c:\\Users\\91991\\.gemini\\antigravity-ide\\brain\\031133ef-b2a6-40fd-831c-533d2b094a6f\\.user_uploaded\\media_1789686651432.jpg";

    console.log("1. Uploading Front & Back Medal to Cloudinary (mountainrun/medals)...");
    const medalUpload = await cloudinary.uploader.upload(newImagePath, {
      folder: "mountainrun/medals",
      public_id: "gandhi_jayanti_2026_front_back_medal",
      overwrite: true
    });
    const medalImageUrl = medalUpload.secure_url;
    console.log("   New Medal URL:", medalImageUrl);

    console.log("2. Uploading Front & Back Banner to Cloudinary (mountainrun/banners)...");
    const bannerUpload = await cloudinary.uploader.upload(newImagePath, {
      folder: "mountainrun/banners",
      public_id: "gandhi_jayanti_2026_front_back_banner",
      overwrite: true
    });
    const bannerImageUrl = bannerUpload.secure_url;
    console.log("   New Banner URL:", bannerImageUrl);

    const slug = "gandhi-jayanti-victory-run-2026";

    // Update in database with retries
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        console.log(`Attempt ${attempt}: Updating event in database...`);
        const updated = await prisma.event.update({
          where: { slug },
          data: {
            medalImageUrl,
            bannerImageUrl,
            priceInPaise: 44900,
            distances: ["1.6 km", "3.2 km", "5 km", "10 km", "21 km"],
            startsAt: new Date("2026-10-02T12:00:00.000Z"),
            endsAt: new Date("2026-10-06T18:29:59.000Z"),
            status: "OPEN",
            featured: true
          }
        });
        console.log("Updated in DB successfully!");
        console.log("Medal URL:", updated.medalImageUrl);
        console.log("Banner URL:", updated.bannerImageUrl);
        break;
      } catch (dbErr: any) {
        console.log(`Attempt ${attempt} failed:`, dbErr.message);
        if (attempt < 4) {
          await new Promise((r) => setTimeout(r, 2000));
        } else {
          throw dbErr;
        }
      }
    }
  } catch (err) {
    console.error("Upload error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
