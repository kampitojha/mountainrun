import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  const slug = "national-unity-day-2026";
  const medalImageUrl = "https://res.cloudinary.com/yppcqzt6/image/upload/v1791198647/mountainrun/medals/national_unity_day_2026_front_back_medal.jpg";

  console.log("Updating database event medalImageUrl for", slug);
  const updated = await prisma.event.update({
    where: { slug },
    data: { medalImageUrl }
  });

  console.log("Updated in DB successfully!");
  console.log("New Medal URL:", updated.medalImageUrl);
}

main().catch(console.error).finally(() => prisma.$disconnect());
