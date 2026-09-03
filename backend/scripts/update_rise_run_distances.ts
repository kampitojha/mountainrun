import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const event = await prisma.event.findUnique({
    where: { slug: "rise-and-run" },
  });

  if (!event) {
    console.log("Event not found!");
    return;
  }

  console.log("Current distances:", event.distances);
  console.log("Current activityTypes:", event.activityTypes);

  const updated = await prisma.event.update({
    where: { slug: "rise-and-run" },
    data: {
      distances: ["1.6 km", "3.2 km", "5 km", "10 km", "21 km"],
      activityTypes: ["running", "cycling"],
    },
  });

  console.log("Updated distances:", updated.distances);
  console.log("Updated activityTypes:", updated.activityTypes);
  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
