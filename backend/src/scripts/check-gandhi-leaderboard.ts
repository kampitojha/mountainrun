import { prisma } from "../lib/prisma.js";

async function main() {
  const events = await prisma.event.findMany({
    select: { id: true, title: true, slug: true, status: true },
  });
  console.log("Events:", events);

  const gandhiEvent = events.find(
    (e) => e.title.toLowerCase().includes("gandhi") || e.slug.toLowerCase().includes("gandhi")
  );

  if (!gandhiEvent) {
    console.log("Gandhi event not found by title/slug. Checking all events registrations...");
    return;
  }

  console.log("Found Gandhi event:", gandhiEvent);

  const regs = await prisma.registration.findMany({
    where: {
      eventId: gandhiEvent.id,
    },
    include: {
      user: true,
      proofUpload: true,
      certificate: true,
    },
    orderBy: [
      { finishTimeSeconds: "asc" }
    ]
  });

  console.log(`Total Gandhi registrations: ${regs.length}`);

  const byStatus: Record<string, number> = {};
  const byProofStatus: Record<string, number> = {};

  regs.forEach((r) => {
    byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    byProofStatus[r.proofStatus] = (byProofStatus[r.proofStatus] || 0) + 1;
  });

  console.log("Status distribution:", byStatus);
  console.log("ProofStatus distribution:", byProofStatus);

  // Filter approved or with finish time
  const approved = regs.filter(
    (r) => r.proofStatus === "APPROVED" && r.finishTimeSeconds != null && r.finishTimeSeconds > 0
  );

  console.log(`Approved with finish time: ${approved.length}`);

  console.log("\n--- TOP APPROVED REGISTRATIONS (by finishTimeSeconds) ---");
  approved.slice(0, 30).forEach((r, idx) => {
    const mins = Math.floor((r.finishTimeSeconds || 0) / 60);
    const secs = (r.finishTimeSeconds || 0) % 60;
    const timeStr = `${mins}m ${secs}s (${r.finishTimeSeconds}s)`;
    console.log(
      `${idx + 1}. [${r.bibNumber}] ${r.user.name} (${r.shippingName}) | Dist: ${r.distance} | Time: ${timeStr} | ProofImg: ${r.proofUpload?.activityImageUrl ? "YES" : "NO"} | App: ${r.proofUpload?.sourceApp || "N/A"}`
    );
  });

  // Also check non-approved submissions with finish times or proof submitted
  const submitted = regs.filter(
    (r) => r.proofStatus === "SUBMITTED"
  );
  console.log(`\nSubmitted (pending review): ${submitted.length}`);

  // Let's also check distances
  const distances = [...new Set(regs.map((r) => r.distance))];
  console.log("\nDistances present in event:", distances);

  for (const dist of distances) {
    const distApproved = approved.filter((r) => r.distance === dist);
    console.log(`\nDistance: ${dist} - Approved count: ${distApproved.length}`);
    distApproved.slice(0, 10).forEach((r, idx) => {
      const mins = Math.floor((r.finishTimeSeconds || 0) / 60);
      const secs = (r.finishTimeSeconds || 0) % 60;
      console.log(
        `  ${idx + 1}. [${r.bibNumber}] ${r.user.name} | Time: ${mins}:${secs.toString().padStart(2, "0")} | Proof: ${r.proofUpload?.activityImageUrl}`
      );
    });
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
