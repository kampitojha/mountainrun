import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname_esm = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname_esm, "../../.env") });

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "Mountain Run <onboarding@mountainrun.in>";

const RUNNER_DATA = {
  name: "Shreya Das",
  email: "shreya2001das03@gmail.com",
  phone: "+919330235171",
  eventSlug: "gandhi-jayanti-victory-run-2026",
  distance: "5 km",
  shippingLine1: "174 Bhupen Roy Road, Behala",
  shippingLine2: "Near Hungru pizza (James long Sarani, Manton Bypass)",
  shippingCity: "Kolkata",
  shippingState: "West Bengal",
  shippingPincode: "700034",
};

async function getUniqueBib() {
  for (let i = 0; i < 15; i++) {
    const random = Math.floor(100000 + Math.random() * 900000);
    const bib = `GJVR-${random}`;
    const existing = await prisma.registration.findUnique({ where: { bibNumber: bib } });
    if (!existing) return bib;
  }
  throw new Error("Could not generate unique BIB after 15 attempts");
}

function buildConfirmationHtml(opts) {
  const DARK_GREEN = "#1a3a2e";
  const GOLD = "#c9a227";
  const CREAM = "#fefcf7";
  const LINE = "#e8dfc8";
  const MUTED = "#8a7a5a";
  const fullAddress = `${opts.shippingLine1}, ${opts.shippingLine2}, ${opts.shippingCity}, ${opts.shippingState} - ${opts.shippingPincode}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Registration Confirmed — Mountain Run</title>
</head>
<body style="margin:0;padding:0;background:#f0ede5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Registration confirmed! Welcome to ${opts.eventTitle}, ${opts.runnerName}. Your Bib is ${opts.bibNumber}. 🏃
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
                    <p style="margin:0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.5);">Run Anywhere, Anytime &bull; National Virtual Marathon Series</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body card -->
          <tr>
            <td style="background:${CREAM};border-left:1px solid ${LINE};border-right:1px solid ${LINE};padding:0;">
              <div style="height:2px;background:linear-gradient(90deg,transparent,${GOLD},transparent);"></div>

              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:36px 40px 20px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:32px;">🎉</p>
                    <h1 style="margin:0 0 6px;font-size:26px;font-weight:800;color:${DARK_GREEN};font-family:Georgia,serif;">
                      Registration Confirmed!
                    </h1>
                    <p style="margin:0 0 18px;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${GOLD};">── You're Officially In ──</p>
                    <p style="margin:0;font-size:15px;color:#334155;line-height:1.7;">
                      Hi <strong style="color:${DARK_GREEN};">${opts.runnerName}</strong>,<br/>
                      Your entry for the <strong>${opts.eventTitle}</strong> is successfully registered and payment has been confirmed! We are thrilled to welcome you back to the starting line. 🏔️
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Bib Callout -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:0 40px 20px;">
                <tr>
                  <td>
                    <div style="background:#ffffff;border:2px solid ${GOLD};border-radius:14px;padding:22px 20px;text-align:center;box-shadow:0 4px 15px rgba(201,162,39,0.12);">
                      <p style="margin:0 0 4px;font-size:11px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:${MUTED};">YOUR OFFICIAL BIB NUMBER</p>
                      <p style="margin:0;font-size:36px;font-weight:900;color:${DARK_GREEN};letter-spacing:0.08em;font-family:monospace;">${opts.bibNumber}</p>
                      <p style="margin:6px 0 0;font-size:14px;font-weight:700;color:#059669;">Category: ${opts.distance} Challenge</p>
                    </div>
                  </td>
                </tr>
              </table>

              <div style="height:1px;background:linear-gradient(90deg,transparent,${GOLD},transparent);margin:0 40px;"></div>

              <!-- Registration Summary Table -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:24px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:12px;overflow:hidden;border:1px solid ${LINE};">
                      <tr>
                        <td style="padding:12px 18px;background:#f8f4ec;border-bottom:1px solid ${LINE};width:42%;">
                          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${MUTED};">🏆 Event</p>
                        </td>
                        <td style="padding:12px 18px;background:#f8f4ec;border-bottom:1px solid ${LINE};">
                          <p style="margin:0;font-size:13px;font-weight:700;color:${DARK_GREEN};">${opts.eventTitle}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 18px;background:#ffffff;border-bottom:1px solid ${LINE};">
                          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${MUTED};">🏃 Distance</p>
                        </td>
                        <td style="padding:12px 18px;background:#ffffff;border-bottom:1px solid ${LINE};">
                          <p style="margin:0;font-size:13px;font-weight:700;color:${DARK_GREEN};">${opts.distance}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 18px;background:#f8f4ec;border-bottom:1px solid ${LINE};">
                          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${MUTED};">🏅 Finisher Kit</p>
                        </td>
                        <td style="padding:12px 18px;background:#f8f4ec;border-bottom:1px solid ${LINE};">
                          <p style="margin:0;font-size:13px;font-weight:800;color:#166534;background:#dcfce7;display:inline-block;padding:2px 10px;border-radius:6px;">Official Finisher Medal &amp; E-Certificate (Confirmed)</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 18px;background:#ffffff;border-bottom:1px solid ${LINE};">
                          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${MUTED};">💳 Payment Status</p>
                        </td>
                        <td style="padding:12px 18px;background:#ffffff;border-bottom:1px solid ${LINE};">
                          <p style="margin:0;font-size:13px;font-weight:700;color:#166534;">PAID (₹${opts.amountInPaise / 100})</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 18px;background:#f8f4ec;">
                          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${MUTED};">📦 Shipping Address</p>
                        </td>
                        <td style="padding:12px 18px;background:#f8f4ec;">
                          <p style="margin:0;font-size:12px;color:#334155;line-height:1.5;">${fullAddress}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Instructions Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:0 40px 28px;">
                <tr>
                  <td>
                    <div style="background:#f1f5f9;border-left:4px solid #059669;border-radius:0 10px 10px 0;padding:16px 20px;">
                      <p style="margin:0 0 6px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;color:#065f46;">
                        📋 How to Complete Your Virtual Run:
                      </p>
                      <ul style="margin:0;padding-left:18px;font-size:13px;color:#475569;line-height:1.6;">
                        <li>Run anywhere, outdoors or treadmill, between <strong>Oct 2 – Oct 6, 2026</strong>.</li>
                        <li>Track your run on any fitness app (Strava, Garmin, Nike, Adidas, etc.).</li>
                        <li>Submit your activity screenshot on <a href="https://mountainrun.in" style="color:#059669;font-weight:700;text-decoration:none;">mountainrun.in</a> to earn your Finisher Medal &amp; E-Certificate!</li>
                      </ul>
                    </div>
                  </td>
                </tr>
              </table>

              <div style="height:1px;background:linear-gradient(90deg,transparent,#c9a227,transparent);margin:0 40px;"></div>

              <!-- Support Note -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:20px 40px 28px;text-align:center;">
                    <p style="margin:0;font-size:12px;color:#64748b;line-height:1.6;">
                      Questions or need help? WhatsApp us at <a href="https://wa.me/917518418960" style="color:#059669;font-weight:700;text-decoration:none;">+91 75184 18960</a> or reply directly to this email.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:${DARK_GREEN};border-radius:0 0 16px 16px;padding:24px 32px;text-align:center;">
              <p style="margin:0 0 4px;font-size:16px;color:rgba(255,255,255,0.9);font-family:Georgia,serif;font-style:italic;">
                Keep Running, Keep Inspiring!
              </p>
              <p style="margin:0 0 14px;font-size:11px;color:${GOLD};letter-spacing:0.2em;text-transform:uppercase;">── Every Finish Has a Story ──</p>
              <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#ffffff;">Mountain Run Team</p>
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.4);">mountainrun.in &bull; &copy; 2026 Mountain Run. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function main() {
  console.log("\n=======================================================");
  console.log("   MANUAL REGISTRATION FOR GANDHI JAYANTI: SHREYA DAS  ");
  console.log("=======================================================\n");

  // Step 1: Find Event
  console.log(`[1] Fetching Event '${RUNNER_DATA.eventSlug}'...`);
  const event = await prisma.event.findUnique({
    where: { slug: RUNNER_DATA.eventSlug },
  });
  if (!event) {
    throw new Error(`Event with slug ${RUNNER_DATA.eventSlug} not found in database!`);
  }
  console.log(`    Found Event: "${event.title}" (ID: ${event.id})`);
  console.log(`    Price: ₹${event.priceInPaise / 100} | Distances: ${event.distances.join(", ")}`);

  // Step 2: Check / Find User
  console.log(`\n[2] Checking User for email '${RUNNER_DATA.email}'...`);
  let user = await prisma.user.findUnique({
    where: { email: RUNNER_DATA.email },
  });
  if (user) {
    console.log(`    Existing User found: ID=${user.id}, Name=${user.name}, Phone=${user.phone}`);
  } else {
    user = await prisma.user.create({
      data: {
        name: RUNNER_DATA.name,
        email: RUNNER_DATA.email,
        phone: RUNNER_DATA.phone,
        role: "RUNNER",
      },
    });
    console.log(`    Created New User: ID=${user.id}`);
  }

  // Step 3: Check Existing Registration for this event & distance
  console.log(`\n[3] Checking if already registered for ${RUNNER_DATA.distance}...`);
  const existingReg = await prisma.registration.findUnique({
    where: {
      userId_eventId_distance: {
        userId: user.id,
        eventId: event.id,
        distance: RUNNER_DATA.distance,
      },
    },
    include: { payment: true },
  });
  if (existingReg) {
    console.log(`    ⚠️ Runner is ALREADY registered: BIB=${existingReg.bibNumber}, Status=${existingReg.status}`);
    return;
  }

  // Step 4: Generate unique BIB
  console.log(`\n[4] Generating unique BIB for ${RUNNER_DATA.eventSlug}...`);
  const bib = await getUniqueBib();
  console.log(`    Generated BIB: ${bib}`);

  // Step 5: Database Transaction (Registration + Payment + Notification)
  console.log(`\n[5] Executing Database Transaction...`);
  const adminNote = `Manual payment of Rs.449 verified via WhatsApp. Registered on ${new Date().toISOString()}`;

  const { registration, payment } = await prisma.$transaction(async (tx) => {
    const reg = await tx.registration.create({
      data: {
        bibNumber: bib,
        userId: user.id,
        eventId: event.id,
        distance: RUNNER_DATA.distance,
        activityType: "running",
        status: "CONFIRMED",
        proofStatus: "NOT_SUBMITTED",
        shippingName: RUNNER_DATA.name,
        shippingPhone: RUNNER_DATA.phone,
        shippingLine1: RUNNER_DATA.shippingLine1,
        shippingLine2: RUNNER_DATA.shippingLine2,
        shippingCity: RUNNER_DATA.shippingCity,
        shippingState: RUNNER_DATA.shippingState,
        shippingPincode: RUNNER_DATA.shippingPincode,
        adminNote: adminNote,
      },
    });

    const pay = await tx.payment.create({
      data: {
        registrationId: reg.id,
        razorpayOrderId: `manual_gandhi_${reg.id}_${Date.now()}`,
        razorpayPaymentId: `manual_upi_whatsapp_${Date.now()}`,
        amountInPaise: event.priceInPaise,
        status: "PAID",
        paidAt: new Date(),
      },
    });

    await tx.notification.create({
      data: {
        userId: user.id,
        channel: "email",
        title: "Registration Confirmed — Gandhi Jayanti Victory Run 2026",
        body: `Your entry for Gandhi Jayanti Victory Run 2026 (5 km) is confirmed with BIB ${bib}.`,
      },
    });

    return { registration: reg, payment: pay };
  });

  console.log(`    [✓] Registration Created: ID=${registration.id} | BIB=${registration.bibNumber}`);
  console.log(`    [✓] Payment Created: ID=${payment.id} | Status=${payment.status} | Amount=₹${payment.amountInPaise / 100}`);

  // Step 6: Generate Preview & Send Confirmation Email
  console.log(`\n[6] Sending Confirmation Email to ${RUNNER_DATA.email}...`);
  const emailOpts = {
    runnerName: RUNNER_DATA.name,
    eventTitle: event.title,
    distance: RUNNER_DATA.distance,
    bibNumber: bib,
    amountInPaise: event.priceInPaise,
    shippingLine1: RUNNER_DATA.shippingLine1,
    shippingLine2: RUNNER_DATA.shippingLine2,
    shippingCity: RUNNER_DATA.shippingCity,
    shippingState: RUNNER_DATA.shippingState,
    shippingPincode: RUNNER_DATA.shippingPincode,
  };

  const emailHtml = buildConfirmationHtml(emailOpts);
  const previewPath = path.resolve(__dirname_esm, "../../../gandhi-registration-email-preview.html");
  fs.writeFileSync(previewPath, emailHtml, "utf-8");
  console.log(`    [✓] Saved email preview: ${previewPath}`);

  try {
    const res = await resend.emails.send({
      from: fromEmail,
      to: RUNNER_DATA.email,
      reply_to: "mountainrunofficial@gmail.com",
      subject: `Registration Confirmed — ${event.title} | Bib ${bib}`,
      html: emailHtml,
    });

    if (res.error) {
      console.error(`    [✗] Resend Error:`, res.error);
    } else {
      console.log(`    [✓] Email successfully sent! Resend ID: ${res.data?.id}`);
    }
  } catch (err) {
    console.error(`    [✗] Email exception:`, err);
  }

  console.log(`\n=======================================================`);
  console.log(`🎉 SUCCESS! Registration Complete:`);
  console.log(`   Name:        ${RUNNER_DATA.name}`);
  console.log(`   Email:       ${RUNNER_DATA.email}`);
  console.log(`   Phone:       ${RUNNER_DATA.phone}`);
  console.log(`   Event:       ${event.title}`);
  console.log(`   Distance:    ${RUNNER_DATA.distance}`);
  console.log(`   BIB Number:  ${bib}`);
  console.log(`   Address:     ${RUNNER_DATA.shippingLine1}, ${RUNNER_DATA.shippingLine2}, ${RUNNER_DATA.shippingCity}, ${RUNNER_DATA.shippingState} - ${RUNNER_DATA.shippingPincode}`);
  console.log(`   Payment:     ₹${event.priceInPaise / 100} (CONFIRMED / PAID)`);
  console.log(`=======================================================\n`);
}

main()
  .catch((err) => {
    console.error("Execution failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
