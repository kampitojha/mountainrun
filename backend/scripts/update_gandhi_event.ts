import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function updateWithRetry(retries = 4, delayMs = 2000) {
  const slug = "gandhi-jayanti-victory-run-2026";
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Attempt ${attempt}: Updating Event '${slug}' in database...`);
      const updated = await prisma.event.update({
        where: { slug },
        data: {
          distances: ["1.6 km", "3.2 km", "5 km", "10 km", "21 km"],
          priceInPaise: 44900,
          // Setting 2026-10-02T12:00:00.000Z ensures day is strictly '2' in both UTC and Asia/Kolkata
          startsAt: new Date("2026-10-02T12:00:00.000Z"),
          endsAt: new Date("2026-10-06T18:29:59.000Z"),
          proofClosesAt: new Date("2026-10-09T18:29:59.000Z"),
          status: "OPEN",
          featured: true
        }
      });
      console.log("Updated successfully in database!");
      console.log("Distances:", updated.distances);
      console.log("Price (paise):", updated.priceInPaise);
      console.log("StartsAt:", updated.startsAt);
      console.log("EndsAt:", updated.endsAt);
      return;
    } catch (err: any) {
      console.log(`Attempt ${attempt} failed:`, err.message || err);
      if (attempt < retries) {
        console.log(`Waiting ${delayMs}ms before retry...`);
        await new Promise((res) => setTimeout(res, delayMs));
      } else {
        throw err;
      }
    }
  }
}

updateWithRetry()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
