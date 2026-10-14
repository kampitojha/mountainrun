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
    console.log("Uploading image to Cloudinary...");
    const imagePath = "c:\\Users\\91991\\.gemini\\antigravity-ide\\brain\\cdae4702-aab3-41ba-8df8-78693a9469d7\\.user_uploaded\\media_1788418021405.jpg";
    const uploadResult = await cloudinary.uploader.upload(imagePath, {
      folder: "mountainrun/medals"
    });
    const medalImageUrl = uploadResult.secure_url;
    console.log("Image uploaded! URL:", medalImageUrl);

    console.log("Creating Event 'Rise and Run'...");
    const event = await prisma.event.create({
      data: {
        title: "Rise and Run",
        slug: "rise-and-run",
        description: "Join the amazing Rise and Run virtual challenge. Push your limits by running, walking, or cycling! A perfect opportunity to stay fit and earn a stunning finisher's medal.",
        status: "OPEN",
        startsAt: new Date("2026-09-13T00:00:00+05:30"),
        endsAt: new Date("2026-09-18T23:59:59+05:30"),
        proofClosesAt: new Date("2026-09-21T23:59:59+05:30"),
        distances: ["2km", "5km", "10km", "21km", "50km", "100km"],
        priceInPaise: 49900, // ₹499 by default, can be edited
        paymentRequired: true,
        medalIncluded: true,
        activityTypes: ["running", "walking", "cycling"],
        benefits: ["Exclusive Physical Medal Delivered", "Digital E-Certificate", "Live Leaderboard", "Access to Community"],
        highlight: "Earn a massive high-quality metal medal!",
        reward: "Physical Finisher Medal & E-Certificate",
        medalImageUrl: medalImageUrl
      }
    });
    console.log("Event created successfully:", event.id, event.slug);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
