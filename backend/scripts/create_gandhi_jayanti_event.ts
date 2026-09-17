import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  const medalImageUrl = "https://res.cloudinary.com/yppcqzt6/image/upload/v1789684982/mountainrun/medals/gandhi_jayanti_victory_run_2026_medal.jpg";
  const bannerImageUrl = "https://res.cloudinary.com/yppcqzt6/image/upload/v1789684985/mountainrun/banners/gandhi_jayanti_victory_run_2026_banner.jpg";

  const slug = "gandhi-jayanti-victory-run-2026";
  const title = "Gandhi Jayanti Victory Run 2026";

  console.log(`Upserting Event '${title}' in database...`);

  const eventData = {
    title,
    description:
      "Celebrate Mahatma Gandhi Jayanti with India's premier virtual fitness challenge — the Gandhi Jayanti Victory Run 2026! Walk, run, or cycle anywhere across India between 2nd to 6th October. Embody the timeless spirit of 'Full Effort • Full Victory', peace, and a Cleaner, Greener, Healthier India. Choose your distance, submit your activity proof, and earn the exclusive heavyweight 3D antique bronze Gandhi Jayanti Finisher Medal with the tricolor ribbon delivered to your doorstep with free shipping.",
    status: "OPEN" as const,
    featured: true,
    startsAt: new Date("2026-10-02T00:00:00+05:30"),
    endsAt: new Date("2026-10-06T23:59:59+05:30"),
    proofClosesAt: new Date("2026-10-09T23:59:59+05:30"),
    distances: ["1.6 km", "3.2 km", "5 km", "10 km", "21 km", "42 km"],
    priceInPaise: 44900, // ₹449
    paymentRequired: true,
    medalIncluded: true,
    activityTypes: ["running", "cycling", "walking"],
    benefits: [
      "Exclusive Heavyweight 3D Antique Bronze Finisher Medal",
      "Indian Tricolor Ribbon with Ashoka Chakra",
      "Personalized Digital E-Certificate with QR Verification",
      "Free Pan-India Doorstep Delivery",
      "GPS Tracking with Strava, Nike, Garmin & Any Fitness App",
      "Live All-India Leaderboard Ranking",
      "Community WhatsApp Group & Regular Updates"
    ],
    highlight: "Full Effort • Full Victory · Limited Edition 3D Bronze Finisher Medal!",
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
  console.log("Status:", event.status);
  console.log("Price:", event.priceInPaise / 100, "INR");
  console.log("Medal URL:", event.medalImageUrl);
  console.log("Banner URL:", event.bannerImageUrl);

  console.log("\nEnsuring Rise and Run status is CLOSED and unfeatured...");
  await prisma.event.updateMany({
    where: { slug: "rise-and-run" },
    data: { status: "CLOSED", featured: false }
  });
  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
