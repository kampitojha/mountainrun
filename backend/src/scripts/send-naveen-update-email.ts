import { Resend } from "resend";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname_esm = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname_esm, "../../.env") });

async function sendUpdatedCategoryEmail() {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Mountain Run <onboarding@mountainrun.in>";
  
  const runner = {
    name: "NAVEEN SAINI",
    email: "naveensaini55005@gmail.com",
    bib: "SDC-902101",
    eventTitle: "Sports Day Celebration",
    newDistance: "10 km",
    oldDistance: "1.6 km",
  };

  const DARK_GREEN = "#1a3a2e";
  const GOLD = "#c9a227";
  const CREAM = "#fefcf7";
  const LINE = "#e8dfc8";

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Distance Category Updated</title></head>
<body style="margin:0;padding:0;background:#f0ede5;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0ede5;padding:32px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
<tr><td style="background:${DARK_GREEN};border-radius:16px 16px 0 0;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
  <td width="33.3%" height="4" style="background:#FF9933;"></td>
  <td width="33.4%" height="4" style="background:#ffffff;"></td>
  <td width="33.3%" height="4" style="background:#138808;"></td>
</tr></table>
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:28px 32px 20px;text-align:center;">
  <div style="display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(201,162,39,0.4);border-radius:50px;padding:6px 20px;margin-bottom:10px;">
    <span style="font-size:11px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:${GOLD};">MOUNTAIN RUN</span>
  </div>
  <p style="margin:0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.5);">Official Race Update · Category Modification</p>
</td></tr></table></td></tr>
<tr><td style="background:${CREAM};border-left:1px solid ${LINE};border-right:1px solid ${LINE};">
<div style="height:2px;background:linear-gradient(90deg,transparent,${GOLD},transparent);"></div>
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:36px 40px 20px;text-align:center;">
  <div style="display:inline-block;width:64px;height:64px;line-height:64px;background:#fbf6e8;border:2px solid ${GOLD};border-radius:50%;font-size:30px;margin-bottom:12px;">🏃‍♂️</div>
  <h1 style="margin:0 0 6px;color:#1c2826;font-size:22px;font-weight:800;">Distance Category Updated!</h1>
  <p style="margin:0;color:#6b7280;font-size:14px;">Hello <strong>${runner.name}</strong>, as requested, your race category for <strong>${runner.eventTitle}</strong> has been successfully updated to <strong>${runner.newDistance}</strong>.</p>
</td></tr></table>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:0 36px 28px;"><tr><td>
  <div style="background:#fff;border:2px solid ${GOLD};border-radius:12px;padding:20px;text-align:center;">
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#888;">YOUR OFFICIAL BIB NUMBER</p>
    <p style="margin:0;font-size:34px;font-weight:900;color:${DARK_GREEN};letter-spacing:0.08em;font-family:monospace;">${runner.bib}</p>
    <p style="margin:6px 0 0;font-size:14px;color:#138808;font-weight:800;">New Category: <strong>${runner.newDistance}</strong></p>
  </div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;border-collapse:collapse;">
    <tr style="border-bottom:1px solid ${LINE};">
      <td style="padding:10px 0;color:#6b7280;font-size:13px;">Event</td>
      <td style="padding:10px 0;color:#1c2826;font-size:13px;font-weight:600;text-align:right;">${runner.eventTitle}</td>
    </tr>
    <tr style="border-bottom:1px solid ${LINE};">
      <td style="padding:10px 0;color:#6b7280;font-size:13px;">Previous Distance</td>
      <td style="padding:10px 0;color:#888;font-size:13px;text-decoration:line-through;text-align:right;">${runner.oldDistance}</td>
    </tr>
    <tr style="border-bottom:1px solid ${LINE};">
      <td style="padding:10px 0;color:#6b7280;font-size:13px;">Updated Distance</td>
      <td style="padding:10px 0;color:#138808;font-size:13px;font-weight:700;text-align:right;">${runner.newDistance}</td>
    </tr>
    <tr>
      <td style="padding:10px 0;color:#6b7280;font-size:13px;">Registration Status</td>
      <td style="padding:10px 0;color:#138808;font-size:13px;font-weight:700;text-align:right;">CONFIRMED</td>
    </tr>
  </table>
  <div style="margin-top:24px;text-align:center;">
    <a href="https://mountainrun.in/dashboard" style="display:inline-block;background:${DARK_GREEN};color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;">Open Runner Dashboard →</a>
  </div>
</td></tr></table></td></tr>
<tr><td style="background:#111;border-radius:0 0 16px 16px;padding:20px;text-align:center;">
  <p style="margin:0;font-size:11px;color:#888;">Mountain Run · Official Event Support</p>
</td></tr></table></td></tr></table></body></html>`;

  console.log(`Sending updated category email to ${runner.email}...`);
  const result = await resend.emails.send({
    from: fromEmail,
    to: runner.email,
    subject: `Category Updated: ${runner.newDistance} Confirmed | BIB ${runner.bib} - Mountain Run`,
    html,
  });

  console.log("Resend response:", result);
}

sendUpdatedCategoryEmail().catch(console.error);
