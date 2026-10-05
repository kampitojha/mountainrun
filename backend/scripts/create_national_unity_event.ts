import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  const medalImageUrl = "https://res.cloudinary.com/yppcqzt6/image/upload/v1791197317/mountainrun/medals/national_unity_day_2026_front_back_medal.jpg";
  const bannerImageUrl = "https://res.cloudinary.com/yppcqzt6/image/upload/v1791197322/mountainrun/banners/national_unity_day_2026_cinematic_poster.jpg";

  const slug = "national-unity-day-2026";
  const title = "National Unity Day Virtual Run 2026";

  console.log(`Upserting Event '${title}' in database...`);

  const eventData = {
    title,
    description:
      "Celebrate National Unity Day (Rashtriya Ekta Diwas) with India's premier virtual fitness challenge — the National Unity Day Virtual Run 2026! Walk, run, or cycle anywhere across India between 31st October to 5th November. Honor the indomitable legacy of Iron Man Sardar Vallabhbhai Patel under the inspiring motto 'Different Paths • Same Nation • Stronger Together'. Choose your distance, record your GPS activity, and earn the exclusive heavyweight 3D antique bronze Sardar Patel & Statue of Unity Finisher Medal, official Mountain Run ribbon, verified digital certificate, and special event Dri-Fit T-Shirt for Top 3 in each category delivered straight to your doorstep with free pan-India shipping!",
    status: "OPEN" as const,
    featured: true,
    startsAt: new Date("2026-10-31T00:00:00+05:30"),
    endsAt: new Date("2026-11-05T23:59:59+05:30"),
    proofClosesAt: new Date("2026-11-08T23:59:59+05:30"),
    distances: ["1.6 km", "3.2 km", "5 km", "10 km", "21 km"],
    priceInPaise: 44900, // ₹449
    paymentRequired: true,
    medalIncluded: true,
    activityTypes: ["running", "cycling", "walking"],
    benefits: [
      "Exclusive Heavyweight 3D Antique Bronze Sardar Patel & Statue of Unity Finisher Medal",
      "Mountain Run Official Custom Woven Neck Ribbon",
      "Special Dri-Fit Event T-Shirt for Top 3 Finishers in Each Category",
      "Free All-India Doorstep Courier Delivery",
      "Personalized Digital E-Certificate with Instant QR Verification",
      "GPS Proof Tracking with Strava, Nike Run Club, Garmin & Any Fitness App",
      "All-India Live Leaderboard Ranking Across 5 Distance Categories",
      "WhatsApp Athletes Community Group & Regular Race Updates"
    ],
    highlight: "Different Paths • Same Nation • Stronger Together · Limited Edition 3D Bronze Finisher Medal!",
    reward: "Heavyweight 3D Finisher Medal & E-Certificate",
    banner: "Open event",
    medalImageUrl,
    bannerImageUrl
  };

  const event = await prisma.event.upsert({
    where: { slug },
    update: eventData,
    create: {
      ...eventData,
      slug
    }
  });

  console.log("Event created/updated successfully!");
  console.log("ID:", event.id);
  console.log("Slug:", event.slug);
  console.log("Title:", event.title);
  console.log("Status:", event.status);
  console.log("Price:", event.priceInPaise / 100, "INR");
  console.log("Medal URL:", event.medalImageUrl);
  console.log("Banner URL:", event.bannerImageUrl);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
