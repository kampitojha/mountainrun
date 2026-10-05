import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function main() {
  const filePath = "C:/Users/91991/.gemini/antigravity-ide/brain/8f7f40e6-1b71-47f1-af19-b38da3b3615c/scratch/star_medal_fast.jpg";
  console.log("Starting upload of star_medal_fast.jpg...");
  const res = await cloudinary.uploader.upload(filePath, {
    folder: "mountainrun/medals",
    public_id: "national_unity_day_2026_front_back_medal",
    overwrite: true,
    invalidate: true
  });
  console.log("Success! Secure URL:", res.secure_url);
}

main().catch(console.error);
