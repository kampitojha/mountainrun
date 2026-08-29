import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import { env } from "../config/env.js";

const prisma = new PrismaClient();

const MEDAL_URL = "https://res.cloudinary.com/yppcqzt6/image/upload/v1788010016/mountainrun/newsletter/tumjbluryk13dbxl4adt.jpg";
const TSHIRT_URL = "https://res.cloudinary.com/yppcqzt6/image/upload/v1788010023/mountainrun/newsletter/ng4hz1fuxpkipsauk2rc.png";

function buildNewsletterHtml(email: string): string {
  const unsubscribeUrl = `https://mountainrun.in/unsubscribe?email=${encodeURIComponent(email)}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sports Day Celebration - Limited Slots</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9; -webkit-font-smoothing: antialiased;">
  
  <!-- Outer Container -->
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f12; padding: 20px 10px;">
    <tr>
      <td align="center">
        
        <!-- Main Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #12181f; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          
          <!-- Top Urgency Banner -->
          <tr>
            <td style="background: linear-gradient(90deg, #d97706, #f59e0b, #d97706); padding: 10px 20px; text-align: center;">
              <p style="margin: 0; font-size: 12px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; color: #78350f;">
                🔥 ALMOST SOLD OUT &bull; ONLY 50 / 250 SLOTS REMAINING
              </p>
            </td>
          </tr>

          <!-- Header Logo Bar -->
          <tr>
            <td style="padding: 28px 24px 20px; text-align: center; border-bottom: 1px solid #1e293b;">
              <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 10px;">
                    <img src="https://mountainrun.in/logo-mark.svg" alt="Mountain Run" width="32" height="32" style="display: block; width: 32px; height: 32px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="font-size: 20px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">
                      Mountain <span style="color: #10b981;">Run</span>
                    </span>
                  </td>
                </tr>
              </table>
              <p style="margin: 6px 0 0; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #64748b;">
                National Virtual Marathon Series
              </p>
            </td>
          </tr>

          <!-- Hero Announcement Section -->
          <tr>
            <td style="padding: 32px 24px 24px; text-align: center;">
              <div style="display: inline-block; background-color: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 50px; padding: 5px 14px; margin-bottom: 16px;">
                <span style="font-size: 11px; font-weight: 800; color: #34d399; letter-spacing: 0.5px; text-transform: uppercase;">
                  🏃 Live National Challenge
                </span>
              </div>
              <h1 style="margin: 0 0 12px; font-size: 26px; sm-font-size: 30px; font-weight: 900; line-height: 1.2; color: #ffffff; letter-spacing: -0.5px;">
                Sports Day Celebration <br><span style="color: #fbbf24;">Virtual Run 2026</span>
              </h1>
              <p style="margin: 0 auto; max-width: 480px; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                Celebrate the champion spirit! Run, jog, or walk at your own comfortable pace anywhere in India. Track with Strava, Nike, or any smartwatch and claim your official die-cast medal.
              </p>
            </td>
          </tr>

          <!-- Finisher Medal Showcase (Hero Image) -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0d1217; border: 1px solid #334155; border-radius: 16px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px; text-align: center;">
                    <div style="margin-bottom: 10px;">
                      <span style="font-size: 11px; font-weight: 800; color: #fbbf24; text-transform: uppercase; letter-spacing: 1px;">
                        🏅 Official Die-Cast Finisher Medal
                      </span>
                    </div>
                    <img src="${MEDAL_URL}" alt="Sports Day Celebration Finisher Medal" width="100%" style="max-width: 460px; height: auto; border-radius: 12px; display: block; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                    <p style="margin: 12px 0 0; font-size: 12px; color: #cbd5e1; font-weight: 600;">
                      Heavy 3D Zinc Alloy Metal &bull; Embossed Athlete Sculptures &bull; Premium Sublimated Lanyard
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- T-Shirt & Perks Showcase (2-Column Grid) -->
          <tr>
            <td style="padding: 0 24px 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0d1217; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px; text-align: center; border-bottom: 1px solid #1e293b;">
                    <span style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px;">
                      👕 Official Mountain Run DRI-FIT Running T-Shirt
                    </span>
                    <img src="${TSHIRT_URL}" alt="Official DRI-FIT Running Jersey" width="100%" style="max-width: 380px; height: auto; border-radius: 10px; display: block; margin: 12px auto 6px;">
                    <p style="margin: 6px 0 0; font-size: 11px; color: #94a3b8;">
                      Moisture-Wicking Technical Fabric &bull; Athlete Graphic Print &bull; Custom Fit
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Everything Included Checklist -->
          <tr>
            <td style="padding: 0 24px 28px;">
              <div style="background-color: #1a222d; border: 1px solid #2d3748; border-radius: 14px; padding: 18px 20px;">
                <p style="margin: 0 0 12px; font-size: 12px; font-weight: 800; color: #f8fafc; text-transform: uppercase; letter-spacing: 1px;">
                  ✨ What Every Registered Runner Receives:
                </p>
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; color: #cbd5e1;">
                      <strong style="color: #10b981;">&check;</strong> Heavy Die-Cast 3D Sports Day Finisher Medal
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; color: #cbd5e1;">
                      <strong style="color: #10b981;">&check;</strong> Verified Digital Certificate with QR Code &amp; Finish Time
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; color: #cbd5e1;">
                      <strong style="color: #10b981;">&check;</strong> National Leaderboard Rank &amp; Personalized Bib
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; color: #cbd5e1;">
                      <strong style="color: #10b981;">&check;</strong> 100% Free Tracked Courier Shipping (Delhivery / DTDC)
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Distances & Flexibility Bar -->
          <tr>
            <td style="padding: 0 24px 28px; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">
                Available Distances (Run / Walk at Your Own Pace):
              </p>
              <div style="font-size: 12px; font-weight: 700; color: #34d399; line-height: 1.8;">
                1.5 KM &bull; 3.2 KM &bull; 5 KM &bull; 7 KM &bull; 10 KM &bull; 15 KM &bull; 21 KM Half Marathon
              </div>
              <p style="margin: 8px 0 0; font-size: 11px; color: #64748b;">
                *Complete in 1 session or split across multiple days (up to 15 days).
              </p>
            </td>
          </tr>

          <!-- Primary CTA Button -->
          <tr>
            <td style="padding: 0 24px 36px; text-align: center;">
              <a href="https://mountainrun.in/events/sports-day-celebration" style="display: block; max-width: 380px; margin: 0 auto; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 900; letter-spacing: 0.5px; padding: 16px 24px; border-radius: 14px; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4); text-transform: uppercase;">
                Claim Your Slot for ₹399 &rarr;
              </a>
              <p style="margin: 12px 0 0; font-size: 11px; color: #94a3b8;">
                ⚡ Only 50 medals left in stock for this edition.
              </p>
            </td>
          </tr>

          <!-- Footer & Unsubscribe -->
          <tr>
            <td style="background-color: #0a0e12; padding: 24px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #64748b;">
                Need help or have questions? WhatsApp us at <a href="https://wa.me/917518418960" style="color: #10b981; text-decoration: none;">+91 75184 18960</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #475569;">
                You received this email because you subscribed on <a href="https://mountainrun.in" style="color: #94a3b8; text-decoration: none;">mountainrun.in</a>.<br>
                <a href="${unsubscribeUrl}" style="color: #64748b; text-decoration: underline;">Unsubscribe from updates</a>
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

async function broadcast() {
  console.log("Starting broadcast to top 50 active subscribers...");

  const subscribers = await prisma.subscriber.findMany({
    where: { subscribed: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  console.log(`Found ${subscribers.length} active subscribers to broadcast.`);

  const resend = new Resend(env.resendApiKey);
  const subject = "⚡ Only 50 Slots Left: Sports Day Celebration Virtual Run | Claim Your Heavy Finisher Medal 🏅";

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < subscribers.length; i++) {
    const sub = subscribers[i];
    const email = sub.email;

    try {
      const html = buildNewsletterHtml(email);
      const res = await resend.emails.send({
        from: env.resendFromEmail,
        to: email,
        subject,
        html,
      });

      if (res.error) {
        console.error(`[${i + 1}/${subscribers.length}] Failed to send to ${email}:`, res.error.message);
        failCount++;
      } else {
        console.log(`[${i + 1}/${subscribers.length}] Sent to ${email} (ID: ${res.data?.id})`);
        successCount++;
      }
    } catch (err) {
      console.error(`[${i + 1}/${subscribers.length}] Exception for ${email}:`, err);
      failCount++;
    }

    // Rate limiting: 250ms delay between emails
    await new Promise((r) => setTimeout(r, 250));
  }

  console.log(`\nBroadcast Complete!`);
  console.log(`Successfully sent: ${successCount}`);
  console.log(`Failed: ${failCount}`);
}

broadcast()
  .catch((err) => {
    console.error("Broadcast failed:", err);
  })
  .finally(() => prisma.$disconnect());
