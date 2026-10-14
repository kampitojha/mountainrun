import { prisma } from "../lib/prisma.js";

async function main() {
  const event = await prisma.event.findFirst({
    where: { slug: { contains: "gandhi", mode: "insensitive" } },
  });

  if (!event) {
    console.log("No Gandhi event found");
    return;
  }

  const allRegs = await prisma.registration.findMany({
    where: {
      eventId: event.id,
      proofStatus: "APPROVED",
    },
    include: {
      user: true,
      proofUpload: true,
    },
    orderBy: {
      finishTimeSeconds: "asc",
    },
  });

  console.log(`Total Approved registrations in Gandhi Jayanti: ${allRegs.length}`);

  const dummies = allRegs.filter(r => r.adminNote === "PODIUM_DUMMY_RANK_PLACEHOLDER");
  const reals = allRegs.filter(r => r.adminNote !== "PODIUM_DUMMY_RANK_PLACEHOLDER");

  console.log(`Total Dummy registrations: ${dummies.length}`);
  console.log(`Total Real registrations: ${reals.length}`);

  console.log("\n--- DUMMY RUNNERS IN DB ---");
  dummies.forEach(d => {
    console.log(`- [${d.distance}] BIB: ${d.bibNumber} | Name: ${d.shippingName} | Time: ${d.finishTimeSeconds}s | Email: ${d.user.email}`);
  });

  const distances = ["1.6 km", "3.2 km", "5 km", "10 km", "21 km"];

  console.log("\n=======================================================");
  console.log("LEADERBOARD BREAKDOWN PER CATEGORY (TOP 5 SHOWN)");
  console.log("=======================================================");

  for (const dist of distances) {
    const catRegs = allRegs.filter(r => r.distance.toLowerCase().replace(/\s/g, '') === dist.toLowerCase().replace(/\s/g, ''));
    console.log(`\n📌 DISTANCE: ${dist} (Total: ${catRegs.length} runners)`);
    
    catRegs.slice(0, 10).forEach((r, idx) => {
      const isDummy = r.adminNote === "PODIUM_DUMMY_RANK_PLACEHOLDER";
      const mins = Math.floor((r.finishTimeSeconds || 0) / 60);
      const secs = (r.finishTimeSeconds || 0) % 60;
      const timeFormatted = `${mins}:${secs.toString().padStart(2, "0")}`;
      const statusLabel = isDummy ? "❌ [DUMMY PLACEHOLDER]" : "✅ [REAL RUNNER]";
      console.log(`  Rank ${idx + 1}: ${statusLabel} ${r.shippingName || r.user.name} (${r.bibNumber}) - Time: ${timeFormatted} - ${r.shippingCity || r.user.email}`);
    });
  }

  // Now let's count: In the Top 3 of each distance, how many are REAL vs DUMMY?
  console.log("\n=======================================================");
  console.log("TOP 3 PODIUM SUMMARY ACROSS ALL 5 DISTANCES:");
  console.log("=======================================================");
  let totalTop3Spots = 0;
  let realInTop3 = 0;
  let dummyInTop3 = 0;

  for (const dist of distances) {
    const catRegs = allRegs.filter(r => r.distance.toLowerCase().replace(/\s/g, '') === dist.toLowerCase().replace(/\s/g, ''));
    const top3 = catRegs.slice(0, 3);
    console.log(`\nCategory: ${dist}`);
    top3.forEach((r, idx) => {
      totalTop3Spots++;
      const isDummy = r.adminNote === "PODIUM_DUMMY_RANK_PLACEHOLDER";
      if (isDummy) dummyInTop3++;
      else realInTop3++;
      console.log(`  Rank ${idx + 1}: ${isDummy ? "DUMMY" : "REAL"} - ${r.shippingName || r.user.name} (${r.bibNumber})`);
    });
  }

  console.log(`\nTotal Top 3 Podium spots: ${totalTop3Spots} (5 categories * 3 spots)`);
  console.log(`Real runners in Top 3: ${realInTop3}`);
  console.log(`Dummy runners in Top 3: ${dummyInTop3}`);
}

main().finally(() => prisma.$disconnect());
