import { PrismaClient } from "@prisma/client";
import { defaultEvents } from "../src/data/default-events.js";

const prisma = new PrismaClient();

async function main() {
  for (const event of defaultEvents) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      create: event,
      update: event,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
