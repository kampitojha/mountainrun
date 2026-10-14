import { Resend } from "resend";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { buildWinnerTshirtEmailHtml } from "./send-winner-tshirt-size-email-test.js";

const PODIUM_WINNERS_LIST = [
  { cat: "1.6 km", rank: "🥇 1st Place (Winner)", bib: "RAR-022007", name: "JAIDEEP SINGH RATHORE", time: "05:48", email: "rs7803600@gmail.com" },
  { cat: "1.6 km", rank: "🥈 2nd Place", bib: "RAR-752636", name: "KEITH COOPER KHONGWET", time: "07:14", email: "koopez75@gmail.com" },
  { cat: "1.6 km", rank: "🥉 3rd Place", bib: "RAR-236816", name: "Akash Roy", time: "07:20", email: "akassroy15@gmail.com" },

  { cat: "3.2 km", rank: "🥇 1st Place (Winner)", bib: "RAR-955620", name: "Manzoor Ahmed Naik", time: "13:01", email: "manzoornaik25@gmail.com" },
  { cat: "3.2 km", rank: "🥈 2nd Place", bib: "RAR-997500", name: "Jai Batra", time: "17:20", email: "jaibatra612@gmail.com" },
  { cat: "3.2 km", rank: "🥉 3rd Place", bib: "RAR-360061", name: "Priyanka Debnath", time: "20:22", email: "priyankadebnath736@gmail.com" },

  { cat: "5 km", rank: "🥇 1st Place (Winner)", bib: "RAR-596446", name: "SUKANTA PAL", time: "18:51", email: "sukantapaul.mid7@gmail.com" },
  { cat: "5 km", rank: "🥈 2nd Place", bib: "RAR-292447", name: "elizabeth ananthi", time: "26:16", email: "elizabethananthi.73@gmail.com" },
  { cat: "5 km", rank: "🥉 3rd Place", bib: "RAR-710322", name: "Sudeep", time: "26:23", email: "sudeep.2119b@gmail.com" },

  { cat: "10 km", rank: "🥇 1st Place (Winner)", bib: "RAR-871227", name: "Harshvardhan", time: "31:53", email: "harshdeshmukh2000@gmail.com" },
  { cat: "10 km", rank: "🥈 2nd Place", bib: "RAR-627239", name: "Papai Maity", time: "33:56", email: "papaimaity663@gmail.com" },
  { cat: "10 km", rank: "🥉 3rd Place", bib: "RAR-463752", name: "Leon Ningthoujam", time: "36:35", email: "narutoningthoujam@gmail.com" },

  { cat: "21 km", rank: "🥇 1st Place (Winner)", bib: "RAR-474191", name: "Parveen", time: "01:06:00", email: "parveenkhatkat200@gmail.com" },
  { cat: "21 km", rank: "🥈 2nd Place", bib: "RAR-283732", name: "sivasaravana moorthy", time: "01:18:00", email: "sivasaravanamoorthy@gmail.com" },
  { cat: "21 km", rank: "🥉 3rd Place", bib: "RAR-815836", name: "Dr. Rahul Nair", time: "01:20:38", email: "dr.r.nair9@gmail.com" },
];

async function broadcastRiseAndRunTop3Winners() {
  console.log("=== Mountain Run Rise and Run Top 3 Winners T-Shirt Claim Email Broadcast ===");
  console.log(`Total Winners to Notify: ${PODIUM_WINNERS_LIST.length}\n`);

  const resend = new Resend(env.resendApiKey);

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < PODIUM_WINNERS_LIST.length; i++) {
    const item = PODIUM_WINNERS_LIST[i];

    // Fetch latest shipping address from DB
    const reg = await prisma.registration.findFirst({
      where: { bibNumber: item.bib },
    });

    const shippingAddress = reg
      ? `${reg.shippingLine1 || ""}, ${reg.shippingCity || ""}, ${reg.shippingState || ""} - ${reg.shippingPincode || ""}`.trim()
      : "Address on record";

    const payload = {
      runnerName: reg?.shippingName || item.name,
      bibNumber: item.bib,
      category: `${item.cat} Challenge`,
      rank: item.rank,
      finishTime: item.time,
      shippingAddress,
      recipientEmail: item.email,
      claimUrl: `https://mountainrun.in/claim-jersey?bib=${encodeURIComponent(item.bib)}`,
      eventName: "Rise and Run 2026",
    };

    console.log(`[${i + 1}/${PODIUM_WINNERS_LIST.length}] Sending to ${payload.runnerName} (${payload.recipientEmail}) - ${item.bib} (${item.cat})...`);

    try {
      const html = buildWinnerTshirtEmailHtml(payload);
      const subject = "🏆 Congratulations! You Won an Official Mountain Run T-Shirt | Submit Your Size";

      const result = await resend.emails.send({
        from: env.resendFromEmail,
        to: payload.recipientEmail,
        replyTo: "mountainrunofficial@gmail.com",
        subject,
        html,
      });

      if (result.error) {
        console.error(`  ❌ Error:`, result.error);
        failed++;
      } else {
        console.log(`  ✓ Sent! (ID: ${result.data?.id})`);
        sent++;
      }
    } catch (err) {
      console.error(`  ❌ Exception:`, err);
      failed++;
    }

    // Rate-limit safety: 600ms delay between emails
    await new Promise((resolve) => setTimeout(resolve, 600));
  }

  console.log(`\n================ Broadcast Summary ================`);
  console.log(`Total: ${PODIUM_WINNERS_LIST.length} | Sent: ${sent} | Failed: ${failed}`);
  await prisma.$disconnect();
}

broadcastRiseAndRunTop3Winners().catch((err) => {
  console.error("Broadcast failed:", err);
  process.exit(1);
});
