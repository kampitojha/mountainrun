import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key exists:", !!process.env.CLOUDINARY_API_KEY);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function main() {
  const medalPath = "C:/Users/91991/.gemini/antigravity-ide/brain/8f7f40e6-1b71-47f1-af19-b38da3b3615c/scratch/unity_medal_opt.jpg";
  const bannerPath = "C:/Users/91991/.gemini/antigravity-ide/brain/8f7f40e6-1b71-47f1-af19-b38da3b3615c/national_unity_day_banner_1791197112825.jpg";

  console.log("Medal file exists:", fs.existsSync(medalPath), "Size:", fs.statSync(medalPath).size);
  console.log("Banner file exists:", fs.existsSync(bannerPath), "Size:", fs.statSync(bannerPath).size);

  console.log("1. Uploading Medal to Cloudinary...");
  const medalUpload = await cloudinary.uploader.upload(medalPath, {
    folder: "mountainrun/medals",
    public_id: "national_unity_day_2026_front_back_medal",
    overwrite: true,
    timeout: 60000
  });
  console.log("Medal URL:", medalUpload.secure_url);

  console.log("2. Uploading Banner to Cloudinary...");
  const bannerUpload = await cloudinary.uploader.upload(bannerPath, {
    folder: "mountainrun/banners",
    public_id: "national_unity_day_2026_cinematic_poster",
    overwrite: true,
    timeout: 60000
  });
  console.log("Banner URL:", bannerUpload.secure_url);
}

main().catch((err) => {
  console.error("Upload failed:", err);
  process.exit(1);
});
