import { prisma } from "../lib/prisma.js";
import { Resend } from "resend";
import { env } from "../config/env.js";

async function main() {
  const oldBib = "RAR-438786";
  const newBib = "RAR-022007";

  console.log(`\n=============================================================`);
  console.log(`  UPDATING BIB: ${oldBib} -> ${newBib}                       `);
  console.log(`=============================================================\n`);

  // 1. Check if new BIB is already taken
  const checkConflict = await prisma.registration.findFirst({
    where: { bibNumber: newBib },
  });

  if (checkConflict) {
    console.error(`❌ Error: BIB ${newBib} is already assigned to registration ID ${checkConflict.id}!`);
    process.exit(1);
  }
  console.log(`✓ BIB ${newBib} is available!`);

  // 2. Fetch current registration
  const reg = await prisma.registration.findFirst({
    where: { bibNumber: oldBib },
    include: {
      user: true,
      event: true,
    },
  });

  if (!reg) {
    console.error(`❌ Error: Registration with BIB ${oldBib} not found!`);
    process.exit(1);
  }

  const athleteName = reg.shippingName || reg.user.name;
  console.log(`Found athlete: ${athleteName} (${reg.user.email})`);
  console.log(`Event: ${reg.event.title} | Distance: ${reg.distance}`);

  // 3. Update BIB in database
  const updatedReg = await prisma.registration.update({
    where: { id: reg.id },
    data: {
      bibNumber: newBib,
      adminNote: `BIB number updated from ${oldBib} to ${newBib} on runner request. (Updated on ${new Date().toISOString()})`,
    },
  });

  console.log(`✓ Registration updated in DB! New BIB: ${updatedReg.bibNumber}`);

  // 4. Send Official Confirmation Email via Resend
  const resendApiKey = env.resendApiKey;
  if (!resendApiKey) {
    console.warn("⚠️ No RESEND_API_KEY configured. Skipping email.");
    return;
  }

  const resend = new Resend(resendApiKey);
  const fromEmail = env.resendFromEmail || "Mountain Run <onboarding@mountainrun.in>";
  const toEmail = reg.user.email;

  const DARK_GREEN = "#1a3a2e";
  const GOLD = "#c9a227";
  const CREAM = "#fefcf7";
  const LINE = "#e8dfc8";
  const MUTED = "#8a7a5a";

  const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Official BIB Number Updated — Mountain Run</title>
</head>
<body style="margin:0;padding:0;background:#f0ede5;font-family:Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Hi ${athleteName}, your official BIB number for ${reg.event.title} has been updated to ${newBib}! 🏃
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0ede5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:${DARK_GREEN};border-radius:16px 16px 0 0;overflow:hidden;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33.3%" height="4" style="background:#FF9933;"></td>
                  <td width="33.4%" height="4" style="background:#ffffff;"></td>
                  <td width="33.3%" height="4" style="background:#138808;"></td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:28px 32px 20px;text-align:center;">
                    <div style="display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(201,162,39,0.4);border-radius:50px;padding:6px 20px;margin-bottom:10px;">
                      <span style="font-size:11px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:${GOLD};">⛰️ MOUNTAIN RUN</span>
                    </div>
                    <p style="margin:0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.6);">Official Registration Update</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background:${CREAM};border-left:1px solid ${LINE};border-right:1px solid ${LINE};padding:0;">
              <div style="height:2px;background:linear-gradient(90deg,transparent,${GOLD},transparent);"></div>

              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:36px 40px 20px;text-align:center;">
                    <div style="display:inline-block;width:64px;height:64px;line-height:64px;background:#fbf6e8;border:2px solid ${GOLD};border-radius:50%;font-size:30px;margin-bottom:12px;">🎽</div>
                    <h1 style="margin:0 0 6px;font-size:24px;font-weight:800;color:${DARK_GREEN};font-family:Georgia,serif;">
                      Your BIB Number Has Been Updated!
                    </h1>
                    <p style="margin:0 0 20px;font-size:13px;letter-spacing:0.15em;text-transform:uppercase;color:${GOLD};">── ${reg.event.title} ──</p>
                    <p style="margin:0;font-size:15px;color:#4a4a4a;line-height:1.7;">
                      Hello <strong style="color:${DARK_GREEN};">${athleteName}</strong>,<br/>
                      As per your request, your official BIB number for <strong>${reg.event.title}</strong> has been successfully customized and updated.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- BIB Highlight Card -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:10px 40px 24px;">
                    <div style="background:#ffffff;border:2px solid ${GOLD};border-radius:14px;padding:24px 20px;text-align:center;box-shadow:0 4px 15px rgba(201,162,39,0.12);">
                      <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${MUTED};">YOUR NEW OFFICIAL BIB NUMBER</p>
                      <p style="margin:0;font-size:36px;font-weight:900;color:${DARK_GREEN};letter-spacing:0.1em;font-family:Consolas,Monaco,monospace;">
                        ${newBib}
                      </p>
                      <p style="margin:8px 0 0;font-size:13px;color:#138808;font-weight:700;">
                        ✓ Successfully Assigned & Verified
                      </p>
                    </div>

                    <!-- Details Table -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;border-collapse:collapse;border:1px solid ${LINE};border-radius:10px;overflow:hidden;background:#fff;">
                      <tr style="border-bottom:1px solid #f0ede5;">
                        <td style="padding:12px 16px;color:#6b7280;font-size:13px;background:#faf8f3;width:40%;">Event Name</td>
                        <td style="padding:12px 16px;color:#1c2826;font-size:13px;font-weight:600;text-align:right;">${reg.event.title}</td>
                      </tr>
                      <tr style="border-bottom:1px solid #f0ede5;">
                        <td style="padding:12px 16px;color:#6b7280;font-size:13px;background:#faf8f3;">Category / Distance</td>
                        <td style="padding:12px 16px;color:#1c2826;font-size:13px;font-weight:600;text-align:right;">${reg.distance}</td>
                      </tr>
                      <tr style="border-bottom:1px solid #f0ede5;">
                        <td style="padding:12px 16px;color:#6b7280;font-size:13px;background:#faf8f3;">Previous BIB</td>
                        <td style="padding:12px 16px;color:#888;font-size:13px;text-decoration:line-through;text-align:right;font-family:monospace;">${oldBib}</td>
                      </tr>
                      <tr style="border-bottom:1px solid #f0ede5;">
                        <td style="padding:12px 16px;color:#6b7280;font-size:13px;background:#faf8f3;">New Customized BIB</td>
                        <td style="padding:12px 16px;color:#138808;font-size:14px;font-weight:800;text-align:right;font-family:monospace;">${newBib}</td>
                      </tr>
                      <tr>
                        <td style="padding:12px 16px;color:#6b7280;font-size:13px;background:#faf8f3;">Registration Status</td>
                        <td style="padding:12px 16px;color:#138808;font-size:13px;font-weight:700;text-align:right;">CONFIRMED</td>
                      </tr>
                    </table>

                    <div style="margin-top:24px;text-align:center;">
                      <a href="https://mountainrun.in/dashboard" style="display:inline-block;background:${DARK_GREEN};color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 32px;border-radius:8px;">
                        Open Runner Dashboard →
                      </a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#111;border-radius:0 0 16px 16px;padding:20px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#ccc;font-weight:600;">Mountain Run · Official Event Support</p>
              <p style="margin:0;font-size:11px;color:#777;">Questions? Contact us at mountainrunofficial@gmail.com</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  console.log(`\nSending official BIB update email to ${toEmail}...`);
  const emailResult = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    replyTo: "mountainrunofficial@gmail.com",
    subject: `Official BIB Number Updated: ${newBib} | ${reg.event.title} - Mountain Run`,
    html: emailHtml,
  });

  console.log("Resend API response:", JSON.stringify(emailResult, null, 2));

  console.log(`\n=============================================================`);
  console.log(`🎉 SUCCESS: BIB UPDATED TO ${newBib} FOR ${athleteName}!`);
  console.log(`   Email: ${toEmail}`);
  console.log(`   Event: ${reg.event.title} (${reg.distance})`);
  console.log(`=============================================================\n`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
