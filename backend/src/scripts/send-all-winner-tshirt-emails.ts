import { Resend } from "resend";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { buildWinnerTshirtEmailHtml } from "./send-winner-tshirt-size-email-test.js";

async function broadcastToTop3Winners() {
  console.log("=== Mountain Run Top 3 Winners T-Shirt Claim Email Broadcast ===");

  const resend = new Resend(env.resendApiKey);

  // Fetch approved finishers for Sports Day Celebration
  const registrations = await prisma.registration.findMany({
    where: {
      event: { slug: "sports-day-celebration" },
      proofStatus: "APPROVED",
    },
    include: {
      user: true,
      event: true,
    },
    orderBy: [{ distance: "asc" }, { finishTimeSeconds: "asc" }],
  });

  // Group by category and take top 3 in each category
  const categories = ["1.6 km", "3.2 km", "5 km", "7 km", "10 km", "15 km", "21 km"];
  const top3Winners: Array<{
    runnerName: string;
    bibNumber: string;
    category: string;
    rank: string;
    finishTime: string;
    shippingAddress: string;
    recipientEmail: string;
    claimUrl: string;
  }> = [];

  for (const cat of categories) {
    const catFinishers = registrations.filter((r) => r.distance.trim() === cat);
    const winners = catFinishers.slice(0, 3);

    winners.forEach((w, idx) => {
      const sec = w.finishTimeSeconds;
      let timeStr = "Verified Finisher";
      if (sec && sec > 0) {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        timeStr = h > 0
          ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
          : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
      }

      let rankStr = "🥇 1st Place (Winner)";
      if (idx === 1) rankStr = "🥈 2nd Place";
      if (idx === 2) rankStr = "🥉 3rd Place";

      const addressStr = `${w.shippingLine1 || ""}, ${w.shippingCity || ""}, ${w.shippingState || ""} - ${w.shippingPincode || ""}`.trim();

      top3Winners.push({
        runnerName: w.shippingName || w.user.name,
        bibNumber: w.bibNumber,
        category: `${cat} Challenge`,
        rank: rankStr,
        finishTime: timeStr,
        shippingAddress: addressStr,
        recipientEmail: w.user.email,
        claimUrl: `https://mountainrun.in/claim-jersey?bib=${encodeURIComponent(w.bibNumber)}`,
      });
    });
  }

  console.log(`Found ${top3Winners.length} podium winners across all categories.`);

  let sent = 0;
  let failed = 0;

  for (const winner of top3Winners) {
    console.log(`\n[${sent + failed + 1}/${top3Winners.length}] Sending to ${winner.runnerName} (${winner.recipientEmail}) - BIB: ${winner.bibNumber}...`);
    try {
      const html = buildWinnerTshirtEmailHtml(winner);
      const subject = "🏆 Congratulations! You Won an Official Mountain Run T-Shirt | Submit Your Size";

      const result = await resend.emails.send({
        from: env.resendFromEmail,
        to: winner.recipientEmail,
        replyTo: "mountainrunofficial@gmail.com",
        subject,
        html,
      });

      if (result.error) {
        console.error(`  ❌ Failed for ${winner.recipientEmail}:`, result.error);
        failed++;
      } else {
        console.log(`  ✓ Successfully sent (ID: ${result.data?.id})`);
        sent++;
      }
    } catch (err) {
      console.error(`  ❌ Error sending to ${winner.recipientEmail}:`, err);
      failed++;
    }

    // Rate-limit safety: 500ms delay between emails
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`\n================ Broadcast Summary ================`);
  console.log(`Total Winners: ${top3Winners.length} | Sent: ${sent} | Failed: ${failed}`);
  await prisma.$disconnect();
}

broadcastToTop3Winners().catch((err) => {
  console.error("Broadcast failed:", err);
  process.exit(1);
});
