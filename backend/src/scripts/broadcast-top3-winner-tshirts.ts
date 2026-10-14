import { Resend } from "resend";
import { env } from "../config/env.js";
import { buildWinnerTshirtEmailHtml } from "./send-winner-tshirt-size-email-test.js";
import * as fs from "fs";
import * as path from "path";

async function run() {
  const possiblePaths = [
    path.resolve(process.cwd(), "../scripts/top3_sports_day.json"),
    path.resolve(process.cwd(), "scripts/top3_sports_day.json"),
    path.resolve(process.cwd(), "top3_sports_day.json")
  ];
  let jsonPath = possiblePaths.find((p) => fs.existsSync(p));
  if (!jsonPath) {
    throw new Error("top3_sports_day.json not found");
  }

  const winners = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  console.log(`Loaded ${winners.length} winners for T-Shirt size email broadcast.`);

  const resend = new Resend(env.resendApiKey);

  let sentCount = 0;
  let failCount = 0;

  for (const [idx, w] of winners.entries()) {
    const rankText = w.rank === 1 ? "🥇 1st Place (Winner)" : (w.rank === 2 ? "🥈 2nd Place (Runner Up)" : "🥉 3rd Place (Podium Finisher)");
    const subject = `🏆 Congratulations! You Won an Official Mountain Run T-Shirt | Submit Your Size (${w.category})`;

    const html = buildWinnerTshirtEmailHtml({
      runnerName: w.name,
      bibNumber: w.bib,
      category: `${w.category} Challenge`,
      rank: rankText,
      finishTime: w.time,
      shippingAddress: `${w.address}, ${w.city}, ${w.state} - ${w.pincode}`,
      recipientEmail: w.email,
    });

    console.log(`[${idx + 1}/${winners.length}] Sending to ${w.name} (${w.email}) | Rank: ${w.rank}...`);

    try {
      const result = await resend.emails.send({
        from: env.resendFromEmail,
        to: w.email,
        replyTo: "mountainrunofficial@gmail.com",
        subject,
        html,
      });

      if (result.error) {
        console.error(`  ❌ Error sending to ${w.email}:`, result.error);
        failCount++;
      } else {
        console.log(`  ✅ Sent! ID: ${result.data?.id}`);
        sentCount++;
      }
    } catch (err) {
      console.error(`  ❌ Exception sending to ${w.email}:`, err);
      failCount++;
    }

    // Gentle delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 600));
  }

  console.log(`\n========================================`);
  console.log(`Broadcast Complete! Sent: ${sentCount}, Failed: ${failCount}`);
  console.log(`========================================`);
}

run().catch(console.error);
