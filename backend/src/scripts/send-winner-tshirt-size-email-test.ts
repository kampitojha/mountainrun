import { Resend } from "resend";
import { env } from "../config/env.js";

const TSHIRT_URL = "https://res.cloudinary.com/yppcqzt6/image/upload/v1788010023/mountainrun/newsletter/ng4hz1fuxpkipsauk2rc.png";

export function buildWinnerTshirtEmailHtml(payload: {
  runnerName: string;
  bibNumber: string;
  category: string;
  rank: string;
  finishTime: string;
  shippingAddress: string;
  recipientEmail: string;
  claimUrl?: string;
}) {
  const claimLink =
    payload.claimUrl || `https://mountainrun.in/claim-jersey?bib=${encodeURIComponent(payload.bibNumber)}`;
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Congratulations Podium Winner - Submit T-Shirt Size</title>
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
            <td style="background: linear-gradient(90deg, #f59e0b, #eab308, #10b981); padding: 8px 16px; text-align: center;">
              <p style="margin: 0; font-size: 11px; font-weight: 800; color: #000000; letter-spacing: 1.5px; text-transform: uppercase;">
                🏆 OFFICIAL PODIUM WINNER &bull; SPORTS DAY CELEBRATION 2026
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

          <!-- Hero Greeting & Trophy Header -->
          <tr>
            <td style="padding: 32px 24px 16px; text-align: center;">
              <div style="display: inline-block; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 50px; padding: 6px 16px; margin-bottom: 16px;">
                <span style="font-size: 11px; font-weight: 800; color: #fbbf24; letter-spacing: 1px; text-transform: uppercase;">
                  🎉 Congratulations Podium Finisher!
                </span>
              </div>
              <h1 style="margin: 0 0 12px; font-size: 26px; font-weight: 900; line-height: 1.25; color: #ffffff; letter-spacing: -0.5px;">
                You Placed in the <span style="color: #fbbf24;">Top 3</span> of <br>Sports Day Celebration 2026!
              </h1>
              <p style="margin: 0 auto; max-width: 480px; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                Dear <strong>${payload.runnerName}</strong>, your verified race submission has secured an official podium rank on the National Leaderboard. You have won an official <strong>Mountain Run DRI-FIT Running Jersey</strong>!
              </p>
            </td>
          </tr>

          <!-- Winner Standing Card -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #131d2a 0%, #0d1520 100%); border: 1px solid #334155; border-radius: 14px; padding: 18px 20px;">
                <tr>
                  <td width="50%" style="vertical-align: top; padding-right: 12px;">
                    <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Category & Rank</p>
                    <p style="margin: 0; font-size: 16px; font-weight: 800; color: #fbbf24;">
                      ${payload.category} &bull; ${payload.rank}
                    </p>
                  </td>
                  <td width="50%" style="vertical-align: top; padding-left: 12px; text-align: right;">
                    <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">BIB & Official Time</p>
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
            <td style="padding: 0 24px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b1119; border: 1px solid #243447; border-radius: 16px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px 16px; text-align: center;">
                    <span style="font-size: 11px; font-weight: 800; color: #34d399; text-transform: uppercase; letter-spacing: 1.5px;">
                      👕 Your Exclusive Winner Reward
                    </span>
                    <h3 style="margin: 6px 0 14px; font-size: 17px; font-weight: 800; color: #ffffff;">
                      Official Mountain Run DRI-FIT Running Jersey
                    </h3>
                    <img src="${TSHIRT_URL}" alt="Mountain Run Official Jersey" width="100%" style="max-width: 380px; height: auto; border-radius: 12px; display: block; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.6);">
                    <p style="margin: 12px auto 0; max-width: 440px; font-size: 12px; line-height: 1.5; color: #94a3b8;">
                      Ultra-lightweight moisture-wicking technical fabric &bull; Anti-chafing active fit &bull; Signature Mountain Run athlete print
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Size Selection Chart -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <div style="background-color: #121b27; border: 1px solid #1e293b; border-radius: 14px; padding: 18px 20px;">
                <p style="margin: 0 0 12px; font-size: 12px; font-weight: 800; color: #e2e8f0; text-transform: uppercase; letter-spacing: 1px; text-align: center;">
                  📏 T-Shirt Size Measurement Guide (Chest in Inches)
                </p>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 12px; text-align: center;">
                  <tr style="background-color: #1a2738;">
                    <th style="padding: 8px; border-radius: 6px 0 0 6px; color: #94a3b8; font-weight: 700;">Size</th>
                    <th style="padding: 8px; color: #94a3b8; font-weight: 700;">Chest (Inches)</th>
                    <th style="padding: 8px; border-radius: 0 6px 6px 0; color: #94a3b8; font-weight: 700;">Fit Type</th>
                  </tr>
                  <tr>
                    <td style="padding: 7px; font-weight: 800; color: #f8fafc; border-bottom: 1px solid #1e293b;">S</td>
                    <td style="padding: 7px; color: #cbd5e1; border-bottom: 1px solid #1e293b;">36" &ndash; 38"</td>
                    <td style="padding: 7px; color: #64748b; border-bottom: 1px solid #1e293b;">Slim / Regular</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px; font-weight: 800; color: #f8fafc; border-bottom: 1px solid #1e293b;">M</td>
                    <td style="padding: 7px; color: #cbd5e1; border-bottom: 1px solid #1e293b;">38" &ndash; 40"</td>
                    <td style="padding: 7px; color: #64748b; border-bottom: 1px solid #1e293b;">Standard Active</td>
                  </tr>
                  <tr style="background-color: rgba(16, 185, 129, 0.08);">
                    <td style="padding: 7px; font-weight: 800; color: #34d399; border-bottom: 1px solid #1e293b;">L</td>
                    <td style="padding: 7px; color: #34d399; font-weight: 700; border-bottom: 1px solid #1e293b;">40" &ndash; 42"</td>
                    <td style="padding: 7px; color: #34d399; font-weight: 700; border-bottom: 1px solid #1e293b;">Most Popular Fit</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px; font-weight: 800; color: #f8fafc; border-bottom: 1px solid #1e293b;">XL</td>
                    <td style="padding: 7px; color: #cbd5e1; border-bottom: 1px solid #1e293b;">42" &ndash; 44"</td>
                    <td style="padding: 7px; color: #64748b; border-bottom: 1px solid #1e293b;">Comfort Relaxed</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px; font-weight: 800; color: #f8fafc;">XXL</td>
                    <td style="padding: 7px; color: #cbd5e1;">44" &ndash; 46"</td>
                    <td style="padding: 7px; color: #64748b;">Plus Comfort</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Action Step: 1-Click Online Size Selection -->
          <tr>
            <td style="padding: 0 24px 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(180deg, #182333 0%, #111a26 100%); border: 2px solid #10b981; border-radius: 16px; padding: 24px 20px;">
                <tr>
                  <td style="text-align: center;">
                    <span style="display: inline-block; background-color: #10b981; color: #041f16; font-size: 10px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; padding: 3px 12px; border-radius: 20px; margin-bottom: 12px;">
                      ⚡ ACTION REQUIRED &bull; 1-CLICK INSTANT CLAIM
                    </span>
                    <h2 style="margin: 0 0 8px; font-size: 21px; font-weight: 900; color: #ffffff;">
                      Select Your Jersey Size Online:
                    </h2>
                    <p style="margin: 0 auto 20px; max-width: 440px; font-size: 13px; color: #cbd5e1; line-height: 1.5;">
                      Click the button below to choose your size (S, M, L, XL, XXL) and confirm your shipping address in seconds:
                    </p>

                    <!-- Big CTA Button -->
                    <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 16px;">
                      <tr>
                        <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);">
                          <a href="${claimLink}" target="_blank" style="display: inline-block; padding: 15px 32px; font-size: 15px; font-weight: 900; color: #022c22; text-decoration: none; border-radius: 12px; letter-spacing: 0.5px; text-transform: uppercase;">
                            Select T-Shirt Size &amp; Claim Jersey &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0 auto; max-width: 380px; font-size: 11px; color: #94a3b8; line-height: 1.4;">
                      Or open this link directly: <br>
                      <a href="${claimLink}" style="color: #38bdf8; text-decoration: underline; word-break: break-all;">${claimLink}</a>
                    </p>

                    <p style="margin: 16px 0 0; font-size: 11px; color: #64748b; font-style: italic;">
                      Note: Once submitted, your custom jersey will be packed and dispatched with live DTDC / Delhivery courier tracking!
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Dispatch Destination Preview -->
          <tr>
            <td style="padding: 0 24px 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0d141e; border: 1px solid #1e293b; border-radius: 14px; padding: 16px 18px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">
                      📦 Shipping Address on Record:
                    </p>
                    <p style="margin: 0; font-size: 13px; font-weight: 600; color: #cbd5e1; line-height: 1.4;">
                      ${payload.runnerName} &bull; ${payload.shippingAddress}
                    </p>
                    <p style="margin: 6px 0 0; font-size: 11px; color: #64748b;">
                      (If you need to update your delivery address, include the new address in your reply.)
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #090e15; padding: 24px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #64748b;">
                Need help or have questions? WhatsApp us at <a href="https://wa.me/917518418960" style="color: #10b981; text-decoration: none; font-weight: 700;">+91 75184 18960</a>
              </p>
              <p style="margin: 0 0 12px; font-size: 11px; color: #475569;">
                Mountain Run &bull; India's Premier Virtual Marathon Community<br>
                Official Website: <a href="https://mountainrun.in" style="color: #38bdf8; text-decoration: none;">mountainrun.in</a> &bull; Instagram: <a href="https://instagram.com/mountainrunofficial" style="color: #f43f5e; text-decoration: none;">@mountainrunofficial</a>
              </p>
              <p style="margin: 0; font-size: 10px; color: #334155;">
                &copy; 2026 Mountain Run. All rights reserved.
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

async function sendTest() {
  console.log("Preparing Top 3 Winner T-Shirt Size Test Email...");

  const html = buildWinnerTshirtEmailHtml({
    runnerName: "Kampit Ojha",
    bibNumber: "SDC-124824",
    category: "5 KM Challenge",
    rank: "🥇 1st Place (Winner)",
    finishTime: "23:48",
    shippingAddress: "Mountain Run Headquarters, Connaught Place, New Delhi - 110001",
    recipientEmail: "itskampitojha@gmail.com",
    claimUrl: "https://mountainrun.in/claim-jersey?bib=SDC-124824",
  });

  // Save HTML preview file locally
  const fs = await import("fs");
  fs.writeFileSync("winner-tshirt-email-preview.html", html, "utf-8");
  console.log("Saved local preview to winner-tshirt-email-preview.html");

  const resend = new Resend(env.resendApiKey);
  const targetEmail = "itskampitojha@gmail.com";
  const subject = "🏆 Congratulations! You Won an Official Mountain Run T-Shirt | Submit Your Size";

  console.log(`Sending test email via Resend to ${targetEmail}...`);
  const result = await resend.emails.send({
    from: env.resendFromEmail,
    to: targetEmail,
    replyTo: "mountainrunofficial@gmail.com",
    subject,
    html,
  });

  console.log("Resend API Result:", JSON.stringify(result, null, 2));
}

sendTest().catch((err) => {
  console.error("Test send error:", err);
  process.exit(1);
});
