import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function main() {
  const medalPath = "C:/Users/91991/.gemini/antigravity-ide/brain/8f7f40e6-1b71-47f1-af19-b38da3b3615c/scratch/national_unity_star_medal_hd.jpg";

  console.log("Medal file exists:", fs.existsSync(medalPath), "Size:", fs.statSync(medalPath).size);

  console.log("Uploading HD Star-Shield Medal to Cloudinary (mountainrun/medals)...");
  const medalUpload = await cloudinary.uploader.upload(medalPath, {
    folder: "mountainrun/medals",
    public_id: "national_unity_day_2026_front_back_medal",
    overwrite: true,
    timeout: 60000
  });
  console.log("New Medal URL:", medalUpload.secure_url);
}

main().catch((err) => {
  console.error("Upload failed:", err);
  process.exit(1);
});
