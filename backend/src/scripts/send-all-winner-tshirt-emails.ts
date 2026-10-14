import { Resend } from "resend";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { buildWinnerTshirtEmailHtml } from "./send-winner-tshirt-size-email-test.js";

const PODIUM_WINNERS_LIST = [
  { cat: "1.6 km", rank: "🥇 1st Place (Winner)", bib: "SDC-640801", name: "NITIN KUMAR", time: "05:50", email: "nitin1804kumar@gmail.com" },
  { cat: "1.6 km", rank: "🥈 2nd Place", bib: "SDC-410349", name: "Shivanshu Vyas", time: "06:03", email: "vyasreshma133@gmail.com" },
  { cat: "1.6 km", rank: "🥉 3rd Place", bib: "SDC-121135", name: "HIVYANSHU DINESHBHAI GOHIL", time: "06:38", email: "satishkothari108@gmail.com" },

  { cat: "3.2 km", rank: "🥇 1st Place (Winner)", bib: "SDC-180028", name: "Abhed Panchal", time: "14:51", email: "abhedpanchal9404@gmail.com" },
  { cat: "3.2 km", rank: "🥈 2nd Place", bib: "SDC-980426", name: "laxmisha", time: "19:19", email: "lakshmishbv1@gmail.com" },
  { cat: "3.2 km", rank: "🥉 3rd Place", bib: "SDC-947131", name: "NAVEEN BALODI", time: "20:20", email: "bigbang1419@gmail.com" },

  { cat: "5 km", rank: "🥇 1st Place (Winner)", bib: "SDC-628721", name: "DEEPAK JANGRA", time: "24:08", email: "deepakjangra19948@gmail.com" },
  { cat: "5 km", rank: "🥈 2nd Place", bib: "SDC-241797", name: "Manoj", time: "24:53", email: "manojkumar7m@gmail.com" },
  { cat: "5 km", rank: "🥉 3rd Place", bib: "SDC-948599", name: "messi kavi", time: "27:34", email: "messikavi@gmail.com" },

  { cat: "7 km", rank: "🥇 1st Place (Winner)", bib: "SDC-264745", name: "Raghunath Singh", time: "50:42", email: "zaildar2009@gmail.com" },
  { cat: "7 km", rank: "🥈 2nd Place", bib: "SDC-181818", name: "Rahul Mandal", time: "56:42", email: "rj.rahulraj099@gmail.com" },
  { cat: "7 km", rank: "🥉 3rd Place", bib: "SDC-114076", name: "anshu raj", time: "01:05:39", email: "anshu152raj@gmail.com" },

  { cat: "10 km", rank: "🥇 1st Place (Winner)", bib: "SDC-137971", name: "Syed Zeeshan Ali", time: "40:21", email: "zeeshanalimail77@gmail.com" },
  { cat: "10 km", rank: "🥈 2nd Place", bib: "SDC-486418", name: "Dharm Patel", time: "45:07", email: "roshentertainment@gmail.com" },
  { cat: "10 km", rank: "🥉 3rd Place", bib: "SDC-900549", name: "Zodinsanga", time: "48:35", email: "sangsangazodinsanga@gmail.com" },

  { cat: "15 km", rank: "🥇 1st Place (Winner)", bib: "SDC-693560", name: "Saumya Mehta", time: "01:54:49", email: "mehtasmooth09@gmail.com" },
  { cat: "15 km", rank: "🥈 2nd Place", bib: "SDC-549851", name: "Dhruvid Gandhi", time: "02:05:21", email: "gandhidhruvid03@gmail.com" },
  { cat: "15 km", rank: "🥉 3rd Place", bib: "SDC-421956", name: "Kunal Jethanandani", time: "75:07:11", email: "kunal.jeth18@gmail.com" },

  { cat: "21 km", rank: "🥇 1st Place (Winner)", bib: "SDC-983396", name: "rakhidave", time: "01:36:00", email: "rakhe.davee@gmail.com" },
  { cat: "21 km", rank: "🥈 2nd Place", bib: "SDC-267623", name: "M Lakshminarayan swamy", time: "01:49:17", email: "lnswamyrock@gmail.com" },
  { cat: "21 km", rank: "🥉 3rd Place", bib: "SDC-132361", name: "Manohar Chakma", time: "01:50:05", email: "manoharchakma5001@gmail.com" },
];

async function broadcastToTop3Winners() {
  console.log("=== Mountain Run Top 3 Winners T-Shirt Claim Email Broadcast ===");
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

broadcastToTop3Winners().catch((err) => {
  console.error("Broadcast failed:", err);
  process.exit(1);
});
