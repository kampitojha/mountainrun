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
    const bannerPath = "C:\\Users\\91991\\.gemini\\antigravity-ide\\brain\\031133ef-b2a6-40fd-831c-533d2b094a6f\\gandhi_victory_banner_1789689125433.jpg";

    console.log("1. Uploading new Cinematic Poster Banner to Cloudinary (mountainrun/banners)...");
    const bannerUpload = await cloudinary.uploader.upload(bannerPath, {
      folder: "mountainrun/banners",
      public_id: "gandhi_jayanti_victory_run_2026_cinematic_poster",
      overwrite: true
    });
    const bannerImageUrl = bannerUpload.secure_url;
    console.log("   Banner URL:", bannerImageUrl);

    const slug = "gandhi-jayanti-victory-run-2026";

    // Update in database with retries
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        console.log(`Attempt ${attempt}: Updating banner in database for '${slug}'...`);
        const updated = await prisma.event.update({
          where: { slug },
          data: {
            bannerImageUrl
          }
        });
        console.log("Updated banner in DB successfully!");
        console.log("New Banner URL:", updated.bannerImageUrl);
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
