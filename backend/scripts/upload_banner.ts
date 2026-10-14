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
    console.log("Uploading banner image to Cloudinary...");
    const imagePath = "c:\\Users\\91991\\.gemini\\antigravity-ide\\brain\\cdae4702-aab3-41ba-8df8-78693a9469d7\\.user_uploaded\\media_1788419225089.jpg";
    const uploadResult = await cloudinary.uploader.upload(imagePath, {
      folder: "mountainrun/banners"
    });
    const bannerImageUrl = uploadResult.secure_url;
    console.log("Banner Image uploaded! URL:", bannerImageUrl);

    console.log("Updating Event 'Rise and Run'...");
    const event = await prisma.event.update({
      where: { slug: 'rise-and-run' },
      data: {
        bannerImageUrl: bannerImageUrl
      }
    });
    console.log("Event updated successfully with banner:", event.slug);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
