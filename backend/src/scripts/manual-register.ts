/**
 * Manual Registration Script
 * --------------------------
 * Registers a user who paid manually (offline/UPI/cash).
 * Safe: uses a transaction, checks for existing user/registration,
 * generates a unique BIB (DB-checked), and sends confirmation email.
 *
 * Run with:
 *   npx tsx src/scripts/manual-register.ts
 */

import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname_esm = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname_esm, "../../.env") });

const prisma = new PrismaClient();

// ─── CONFIGURATION ─────────────────────────────────────────────────────────

const RUNNER = {
  name: "Kunal Jethanandani",
  email: "kunal.jeth18@gmail.com",
  phone: "9616227463",
};

const REGISTRATION_DETAILS = {
  distance: "15 km",
  activityType: "running",
  shippingName: "Kunal Jethanandani",
  shippingPhone: "9616227463",
  shippingLine1: "6/196 Vikas Nagar",
  shippingLine2: "Opp. R.L.B.",
  shippingCity: "Lucknow",
  shippingState: "Uttar Pradesh",
  shippingPincode: "226022",
  adminNote: "Manual payment Rs.200 collected offline. Offered discount from Rs.399. WhatsApp verified on 26-Aug-2026.",
};

const AMOUNT_PAID_PAISE = 20000; // Rs.200

// ─── BIB ───────────────────────────────────────────────────────────────────

function generateBibCandidate(eventSlug: string): string {
  const eventCode = eventSlug
    .split("-")
    .map((part: string) => part[0])
    .join("")
    .slice(0, 4)
    .toUpperCase()
    .padEnd(3, "R");
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${eventCode}-${random}`;
}

async function getUniqueBib(eventSlug: string): Promise<string> {
  let bib: string = "";
  for (let i = 0; i < 10; i++) {
    bib = generateBibCandidate(eventSlug);
    const existing = await prisma.registration.findUnique({ where: { bibNumber: bib } });
    if (!existing) return bib;
    console.log(`  BIB ${bib} taken, retrying...`);
  }
  throw new Error("Could not generate unique BIB after 10 attempts");
}

// ─── EMAIL ─────────────────────────────────────────────────────────────────

async function sendConfirmationEmail(opts: {
  to: string; runnerName: string; eventTitle: string;
  distance: string; bibNumber: string; amountInPaise: number;
}) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Mountain Run <onboarding@mountainrun.in>";
  const amountRs = `Rs. ${Math.round(opts.amountInPaise / 100)}`;
  const DARK_GREEN = "#1a3a2e"; const GOLD = "#c9a227"; const CREAM = "#fefcf7"; const LINE = "#e8dfc8";

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Registration Confirmed</title></head>
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
  <p style="margin:0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.5);">Run Anywhere, Anytime</p>
</td></tr></table></td></tr>
<tr><td style="background:${CREAM};border-left:1px solid ${LINE};border-right:1px solid ${LINE};">
<div style="height:2px;background:linear-gradient(90deg,transparent,${GOLD},transparent);"></div>
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:36px 40px 20px;text-align:center;">
  <p style="margin:0 0 4px;font-size:28px;">🎉</p>
  <h1 style="margin:0 0 6px;font-size:26px;font-weight:800;color:${DARK_GREEN};font-family:Georgia,serif;">Registration Confirmed!</h1>
  <p style="margin:0 0 20px;font-size:13px;letter-spacing:0.15em;text-transform:uppercase;color:${GOLD};">── You're officially in! ──</p>
  <p style="margin:0;font-size:15px;color:#4a4a4a;line-height:1.7;">
    Hi <strong style="color:${DARK_GREEN};">${opts.runnerName}</strong>,<br/>
    Your Mountain Run registration is confirmed and payment has been received successfully.<br/>
    We're thrilled to have you on board! 🏔️
  </p>
</td></tr></table>
<div style="height:1px;background:linear-gradient(90deg,transparent,${GOLD},transparent);margin:0 40px;"></div>
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:24px 40px;">
<table width="100%" cellpadding="12" cellspacing="0" border="0" style="border-radius:12px;overflow:hidden;border:1px solid ${LINE};">
  <tr style="background:#f7f3e9;"><td style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#8a7a5a;width:45%;">Event</td><td style="font-size:14px;font-weight:600;color:${DARK_GREEN};">${opts.eventTitle}</td></tr>
  <tr><td style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#8a7a5a;">Distance</td><td style="font-size:14px;font-weight:600;color:${DARK_GREEN};">${opts.distance}</td></tr>
  <tr style="background:#f7f3e9;"><td style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#8a7a5a;">Bib Number</td><td style="font-size:18px;font-weight:800;color:${GOLD};font-family:monospace;">${opts.bibNumber}</td></tr>
  <tr><td style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#8a7a5a;">Amount Paid</td><td style="font-size:14px;font-weight:600;color:${DARK_GREEN};">${amountRs}</td></tr>
</table>
</td></tr></table>
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:20px 40px 36px;text-align:center;">
  <p style="margin:0;font-size:13px;color:#8a7a5a;line-height:1.6;">
    Upload your run proof on <a href="https://mountainrun.in" style="color:${GOLD};">mountainrun.in</a> after completing your run.<br/>
    Questions? Reply to this email or WhatsApp us.
  </p>
</td></tr></table>
</td></tr>
<tr><td style="background:${DARK_GREEN};border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
  <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.4);">© Mountain Run</p>
</td></tr>
</table></td></tr></table></body></html>`;

  return resend.emails.send({
    from: fromEmail,
    to: opts.to,
    subject: `Registration Confirmed — ${opts.eventTitle} | Bib ${opts.bibNumber}`,
    html,
  });
}

// ─── MAIN ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n=== Mountain Run — Manual Registration Script ===\n");

  // Step 1: Find active event
  console.log("Step 1: Finding active events in DB...");
  const events = await prisma.event.findMany({ orderBy: { createdAt: "desc" } });
  if (events.length === 0) throw new Error("No events found in DB at all!");
  
  console.log("Events in DB:");
  events.forEach((e, i) => console.log(`  [${i}] [${e.status}] "${e.title}" | distances: ${e.distances.join(", ")} | price: Rs.${e.priceInPaise/100}`));

  // Pick the first OPEN event, or fall back to most recent
  const event = events.find(e => e.status === "OPEN") ?? events[0];
  console.log(`\nUsing event: "${event.title}" (slug: ${event.slug})`);

  // Step 2: Check/create user
  console.log(`\nStep 2: Checking user for ${RUNNER.email}...`);
  let user = await prisma.user.findUnique({ where: { email: RUNNER.email } });
  if (user) {
    console.log(`  User exists: id=${user.id}`);
  } else {
    user = await prisma.user.create({
      data: { name: RUNNER.name, email: RUNNER.email, phone: RUNNER.phone, role: "RUNNER" },
    });
    console.log(`  Created user: id=${user.id}`);
  }

  // Step 3: Check existing registration
  console.log(`\nStep 3: Checking existing registration...`);
  const existingReg = await prisma.registration.findFirst({
    where: { userId: user.id, eventId: event.id },
  });
  if (existingReg) {
    console.log(`ALREADY REGISTERED: bib=${existingReg.bibNumber}, status=${existingReg.status}`);
    console.log("Exiting — no duplicate created.");
    return;
  }
  console.log("  No existing registration. Good.");

  // Step 4: Unique BIB
  console.log(`\nStep 4: Generating unique BIB...`);
  const bib = await getUniqueBib(event.slug);
  console.log(`  BIB: ${bib}`);

  // Step 5: Transaction
  console.log(`\nStep 5: Creating Registration + Payment (transaction)...`);
  const { registration, payment } = await prisma.$transaction(async (tx) => {
    const reg = await tx.registration.create({
      data: {
        bibNumber: bib,
        userId: user!.id,
        eventId: event.id,
        distance: REGISTRATION_DETAILS.distance,
        activityType: REGISTRATION_DETAILS.activityType,
        status: "CONFIRMED",
        shippingName: REGISTRATION_DETAILS.shippingName,
        shippingPhone: REGISTRATION_DETAILS.shippingPhone,
        shippingLine1: REGISTRATION_DETAILS.shippingLine1,
        shippingLine2: REGISTRATION_DETAILS.shippingLine2,
        shippingCity: REGISTRATION_DETAILS.shippingCity,
        shippingState: REGISTRATION_DETAILS.shippingState,
        shippingPincode: REGISTRATION_DETAILS.shippingPincode,
        adminNote: REGISTRATION_DETAILS.adminNote,
      },
    });
    const pay = await tx.payment.create({
      data: {
        registrationId: reg.id,
        razorpayOrderId: `manual_${reg.id}_${Date.now()}`,
        razorpayPaymentId: `manual_wp_${Date.now()}`,
        amountInPaise: AMOUNT_PAID_PAISE,
        status: "PAID",
        paidAt: new Date(),
      },
    });
    return { registration: reg, payment: pay };
  });
  console.log(`  Registration: id=${registration.id}`);
  console.log(`  Payment: id=${payment.id}, amount=Rs.${AMOUNT_PAID_PAISE/100} PAID`);

  // Step 6: Send email
  console.log(`\nStep 6: Sending email to ${RUNNER.email}...`);
  try {
    const emailResult = await sendConfirmationEmail({
      to: RUNNER.email,
      runnerName: RUNNER.name,
      eventTitle: event.title,
      distance: REGISTRATION_DETAILS.distance,
      bibNumber: bib,
      amountInPaise: AMOUNT_PAID_PAISE,
    });
    if (emailResult.error) {
      console.error("  Email error:", emailResult.error);
    } else {
      console.log(`  Email sent! id=${emailResult.data?.id}`);
    }
  } catch (err) {
    console.error("  Email threw (registration still saved):", err);
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`DONE!`);
  console.log(`Runner:     ${user.name} <${user.email}>`);
  console.log(`Event:      ${event.title}`);
  console.log(`Distance:   ${REGISTRATION_DETAILS.distance}`);
  console.log(`BIB:        ${bib}`);
  console.log(`Paid:       Rs.${AMOUNT_PAID_PAISE/100} (standard Rs.${event.priceInPaise/100})`);
  console.log(`Status:     CONFIRMED`);
  console.log(`Reg ID:     ${registration.id}`);
  console.log(`${"=".repeat(50)}\n`);
}

main().catch(async (err) => {
  console.error("Script failed:", err);
  await prisma.$disconnect();
  process.exit(1);
}).finally(() => prisma.$disconnect());
