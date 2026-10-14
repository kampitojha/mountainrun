import { Resend } from "resend";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

const TSHIRT_URL =
  "https://res.cloudinary.com/yppcqzt6/image/upload/v1788010023/mountainrun/newsletter/ng4hz1fuxpkipsauk2rc.png";

// The 5 runners who have NOT yet submitted their size
const PENDING_5_WINNERS = [
  {
    bib: "SDC-121135",
    cat: "1.6 km",
    rank: "🥉 3rd Place",
    name: "HIVYANSHU DINESHBHAI GOHIL",
    time: "06:38",
    email: "satishkothari108@gmail.com",
    phone: "+91 7096445633",
  },
  {
    bib: "SDC-628721",
    cat: "5 km",
    rank: "🥇 1st Place (Winner)",
    name: "DEEPAK JANGRA",
    time: "24:08",
    email: "deepakjangra19948@gmail.com",
    phone: "+91 8685908705",
  },
  {
    bib: "SDC-948599",
    cat: "5 km",
    rank: "🥉 3rd Place",
    name: "messi kavi",
    time: "27:34",
    email: "messikavi@gmail.com",
    phone: "+91 9791585373",
  },
  {
    bib: "SDC-693560",
    cat: "15 km",
    rank: "🥇 1st Place (Winner)",
    name: "Saumya Mehta",
    time: "01:54:49",
    email: "mehtasmooth09@gmail.com",
    phone: "+91 9825921073",
  },
  {
    bib: "SDC-267623",
    cat: "21 km",
    rank: "🥈 2nd Place",
    name: "M Lakshminarayan swamy",
    time: "01:49:17",
    email: "lnswamyrock@gmail.com",
    phone: "+91 8605323327",
  },
];

function buildFinalReminderEmailHtml(payload: {
  runnerName: string;
  bibNumber: string;
  category: string;
  rank: string;
  finishTime: string;
  shippingAddress: string;
  claimUrl: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Final Reminder: Submit Your T-Shirt Size - Mountain Run</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070a0d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9; -webkit-font-smoothing: antialiased;">

  <!-- Outer Wrapper -->
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070a0d; padding: 24px 12px;">
    <tr>
      <td align="center">

        <!-- Card Container (Max 600px) -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0f1722; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.65);">

          <!-- Top Urgency Ribbon -->
          <tr>
            <td style="background: linear-gradient(90deg, #ef4444, #f59e0b, #ef4444); padding: 9px 16px; text-align: center;">
              <p style="margin: 0; font-size: 11px; font-weight: 900; color: #ffffff; letter-spacing: 1.5px; text-transform: uppercase;">
                ⏰ FINAL REMINDER &bull; T-SHIRT SIZE SUBMISSION FOR DISPATCH
              </p>
            </td>
          </tr>

          <!-- Header Logo Bar -->
          <tr>
            <td style="padding: 24px 24px 18px; text-align: center; border-bottom: 1px solid #1e293b;">
              <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 10px;">
                    <img src="https://mountainrun.in/logo-mark.svg" alt="Mountain Run" width="34" height="34" style="display: block; width: 34px; height: 34px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">
                      Mountain <span style="color: #10b981;">Run</span>
                    </span>
                  </td>
                </tr>
              </table>
              <p style="margin: 4px 0 0; font-size: 10px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: #64748b;">
                National Virtual Marathon Series
              </p>
            </td>
          </tr>

          <!-- Hero Greeting -->
          <tr>
            <td style="padding: 30px 24px 16px; text-align: center;">
              <div style="display: inline-block; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 50px; padding: 6px 16px; margin-bottom: 16px;">
                <span style="font-size: 11px; font-weight: 800; color: #f87171; letter-spacing: 1px; text-transform: uppercase;">
                  ⚠️ DISPATCH PREPARATION IN PROGRESS
                </span>
              </div>
              <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 900; line-height: 1.3; color: #ffffff; letter-spacing: -0.5px;">
                Confirm Your Jersey Size Today,<br><span style="color: #fbbf24;">${payload.runnerName}</span>!
              </h1>
              <p style="margin: 0 auto; max-width: 480px; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
                Congratulations again on securing a podium rank in the <strong>Sports Day Celebration 2026</strong>. 
                Our team is currently preparing the winner DRI-FIT jerseys for shipping, but <strong>we have not yet received your T-Shirt size</strong>.
              </p>
            </td>
          </tr>

          <!-- Winner Standing Card -->
          <tr>
            <td style="padding: 0 24px 20px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #131d2a 0%, #0d1520 100%); border: 1px solid #334155; border-radius: 14px; padding: 18px 20px;">
                <tr>
                  <td width="50%" style="vertical-align: top; padding-right: 12px;">
                    <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Category &amp; Rank</p>
                    <p style="margin: 0; font-size: 15px; font-weight: 800; color: #fbbf24;">
                      ${payload.category} &bull; ${payload.rank}
                    </p>
                  </td>
                  <td width="50%" style="vertical-align: top; padding-left: 12px; text-align: right;">
                    <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">BIB &amp; Official Time</p>
                    <p style="margin: 0; font-size: 15px; font-weight: 800; color: #38bdf8; font-family: monospace;">
                      ${payload.bibNumber} &bull; ${payload.finishTime}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- T-Shirt Image Showcase -->
          <tr>
            <td style="padding: 0 24px 20px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b1119; border: 1px solid #243447; border-radius: 16px; overflow: hidden;">
                <tr>
                  <td style="padding: 18px 16px; text-align: center;">
                    <span style="font-size: 11px; font-weight: 800; color: #34d399; text-transform: uppercase; letter-spacing: 1.5px;">
                      👕 Official Mountain Run Dri-Fit Jersey
                    </span>
                    <img src="${TSHIRT_URL}" alt="Mountain Run Official Jersey" width="100%" style="max-width: 360px; height: auto; border-radius: 12px; display: block; margin: 12px auto 0; box-shadow: 0 10px 30px rgba(0,0,0,0.6);">
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Size Guide -->
          <tr>
            <td style="padding: 0 24px 20px;">
              <div style="background-color: #121b27; border: 1px solid #1e293b; border-radius: 14px; padding: 16px 20px;">
                <p style="margin: 0 0 10px; font-size: 11px; font-weight: 800; color: #e2e8f0; text-transform: uppercase; letter-spacing: 1px; text-align: center;">
                  📏 Size Guide (Chest in Inches)
                </p>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 12px; text-align: center;">
                  <tr style="background-color: #1a2738;">
                    <th style="padding: 6px; color: #94a3b8; font-weight: 700;">S</th>
                    <th style="padding: 6px; color: #94a3b8; font-weight: 700;">M</th>
                    <th style="padding: 6px; color: #34d399; font-weight: 800;">L (Popular)</th>
                    <th style="padding: 6px; color: #94a3b8; font-weight: 700;">XL</th>
                    <th style="padding: 6px; color: #94a3b8; font-weight: 700;">XXL</th>
                  </tr>
                  <tr>
                    <td style="padding: 6px; color: #cbd5e1;">36"-38"</td>
                    <td style="padding: 6px; color: #cbd5e1;">38"-40"</td>
                    <td style="padding: 6px; color: #34d399; font-weight: 700;">40"-42"</td>
                    <td style="padding: 6px; color: #cbd5e1;">42"-44"</td>
                    <td style="padding: 6px; color: #cbd5e1;">44"-46"</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- 1-Click Action Card -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(180deg, #182333 0%, #111a26 100%); border: 2px solid #10b981; border-radius: 16px; padding: 22px 20px;">
                <tr>
                  <td style="text-align: center;">
                    <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 900; color: #ffffff;">
                      Submit Your Size Online (Takes 10 Seconds):
                    </h2>
                    <p style="margin: 0 auto 18px; max-width: 440px; font-size: 13px; color: #cbd5e1; line-height: 1.5;">
                      Click the button below to pick your size (S, M, L, XL, XXL) and confirm your dispatch address:
                    </p>

                    <!-- CTA Button -->
                    <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 16px;">
                      <tr>
                        <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);">
                          <a href="${payload.claimUrl}" target="_blank" style="display: inline-block; padding: 15px 32px; font-size: 15px; font-weight: 900; color: #022c22; text-decoration: none; border-radius: 12px; letter-spacing: 0.5px; text-transform: uppercase;">
                            Select T-Shirt Size &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0 auto; max-width: 400px; font-size: 11px; color: #94a3b8; line-height: 1.4;">
                      Or open this link directly: <br>
                      <a href="${payload.claimUrl}" style="color: #38bdf8; text-decoration: underline; word-break: break-all;">${payload.claimUrl}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Direct Reply Fallback Card -->
          <tr>
            <td style="padding: 0 24px 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0d1520; border: 1px dashed #334155; border-radius: 14px; padding: 16px 20px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 6px; font-size: 13px; font-weight: 800; color: #fbbf24;">
                      💡 Can't open the link? Reply directly to this email!
                    </p>
                    <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #94a3b8;">
                      Simply reply to this email with: <br>
                      &bull; <strong>T-Shirt Size:</strong> S / M / L / XL / XXL <br>
                      &bull; <strong>Delivery Address:</strong> (If different from: <em>${payload.shippingAddress}</em>)
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 24px 28px; text-align: center; border-top: 1px solid #1e293b; background-color: #0a0e14;">
              <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #94a3b8;">
                Team Mountain Run
              </p>
              <p style="margin: 0; font-size: 11px; color: #475569;">
                Official Inquiries: <a href="mailto:mountainrunofficial@gmail.com" style="color: #64748b; text-decoration: underline;">mountainrunofficial@gmail.com</a> &bull; <a href="https://mountainrun.in" style="color: #64748b; text-decoration: underline;">mountainrun.in</a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
}

async function sendPending5WinnersReminder() {
  console.log("=== Mountain Run: Sending Final Reminder to 5 Pending Winners ===\n");

  const resend = new Resend(env.resendApiKey);

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < PENDING_5_WINNERS.length; i++) {
    const item = PENDING_5_WINNERS[i];

    // Double check from DB that tshirtSize is still not submitted
    const reg = await prisma.registration.findFirst({
      where: { bibNumber: item.bib },
    });

    if (reg?.tshirtSize) {
      console.log(`⚠️ Skipped ${item.bib} (${item.name}) - already has size: ${reg.tshirtSize}`);
      continue;
    }

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
      claimUrl: `https://mountainrun.in/claim-jersey?bib=${encodeURIComponent(item.bib)}`,
    };

    const subject = `⏰ FINAL REMINDER: Submit Your T-Shirt Size for Dispatch | Mountain Run (BIB: ${item.bib})`;
    const html = buildFinalReminderEmailHtml(payload);

    console.log(`[${i + 1}/${PENDING_5_WINNERS.length}] Sending to ${payload.runnerName} <${item.email}> (BIB: ${item.bib})...`);

    try {
      const result = await resend.emails.send({
        from: env.resendFromEmail,
        to: item.email,
        replyTo: "mountainrunofficial@gmail.com",
        subject,
        html,
      });

      if (result.error) {
        console.error(`  ❌ Error sending to ${item.bib}:`, result.error);
        failed++;
      } else {
        console.log(`  ✓ Sent successfully! (Resend Email ID: ${result.data?.id})`);
        sent++;
      }
    } catch (err) {
      console.error(`  ❌ Exception sending to ${item.bib}:`, err);
      failed++;
    }

    // Safety delay between emails
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  console.log(`\n================ Summary ================`);
  console.log(`Total Pending: ${PENDING_5_WINNERS.length} | Sent: ${sent} | Failed: ${failed}`);
  await prisma.$disconnect();
}

sendPending5WinnersReminder().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
