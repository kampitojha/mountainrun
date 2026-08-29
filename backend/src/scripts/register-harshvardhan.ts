import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname_esm = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname_esm, "../../.env") });

const prisma = new PrismaClient();

const RUNNER = {
  name: "Harshvardhan Mani Dixit",
  email: "harshvardhanmanidixit@gmail.com",
  phone: "9935996853",
};

const REGISTRATION_DETAILS = {
  distance: "5 km",
  activityType: "running",
  shippingName: "Harshvardhan Mani Dixit",
  shippingPhone: "9935996853",
  shippingLine1: "C/O Himanshu Mani Dixit, Near Old Aadhar Card Office",
  shippingLine2: "Civil Lines, Uma Riddhi Sadan, Alt: 7317286303",
  shippingCity: "Balrampur",
  shippingState: "Uttar Pradesh",
  shippingPincode: "271201",
  adminNote: "Manual payment Rs.200 collected via UPI (50% off). Wheelchair athlete, friend of Kunal Jethanandani. Verified on WhatsApp 28-Aug-2026.",
};

const AMOUNT_PAID_PAISE = 20000; // Rs.200

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

async function sendConfirmationEmail(opts: {
  to: string;
  runnerName: string;
  eventTitle: string;
  distance: string;
  bibNumber: string;
  amountInPaise: number;
}) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Mountain Run <onboarding@mountainrun.in>";
  const amountRs = `₹${Math.round(opts.amountInPaise / 100)}`;
  const DARK_GREEN = "#1a3a2e";
  const GOLD = "#c9a227";
  const CREAM = "#fefcf7";
  const LINE = "#e8dfc8";

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
  <div style="display:inline-block;width:64px;height:64px;line-height:64px;background:#fbf6e8;border:2px solid ${GOLD};border-radius:50%;font-size:30px;margin-bottom:12px;">🎉</div>
  <h1 style="margin:0 0 6px;color:#1c2826;font-size:22px;font-weight:800;">You're Officially Registered!</h1>
  <p style="margin:0;color:#6b7280;font-size:14px;">Welcome, <strong>${opts.runnerName}</strong>! Your registration for <strong>${opts.eventTitle}</strong> is confirmed.</p>
</td></tr></table>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:0 36px 28px;"><tr><td>
  <div style="background:#fff;border:2px solid ${GOLD};border-radius:12px;padding:20px;text-align:center;">
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#888;">YOUR OFFICIAL BIB NUMBER</p>
    <p style="margin:0;font-size:34px;font-weight:900;color:${DARK_GREEN};letter-spacing:0.08em;font-family:monospace;">${opts.bibNumber}</p>
    <p style="margin:6px 0 0;font-size:13px;color:#555;">Category: <strong>${opts.distance}</strong></p>
  </div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;border-collapse:collapse;">
    <tr style="border-bottom:1px solid ${LINE};">
      <td style="padding:10px 0;color:#6b7280;font-size:13px;">Event</td>
      <td style="padding:10px 0;color:#1c2826;font-size:13px;font-weight:600;text-align:right;">${opts.eventTitle}</td>
    </tr>
    <tr style="border-bottom:1px solid ${LINE};">
      <td style="padding:10px 0;color:#6b7280;font-size:13px;">Amount Paid</td>
      <td style="padding:10px 0;color:#138808;font-size:13px;font-weight:700;text-align:right;">${amountRs} (Special 50% Off)</td>
    </tr>
    <tr style="border-bottom:1px solid ${LINE};">
      <td style="padding:10px 0;color:#6b7280;font-size:13px;">Payment Mode</td>
      <td style="padding:10px 0;color:#1c2826;font-size:13px;font-weight:600;text-align:right;">UPI / Offline (Verified)</td>
    </tr>
    <tr>
      <td style="padding:10px 0;color:#6b7280;font-size:13px;">Status</td>
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

  return resend.emails.send({
    from: fromEmail,
    to: opts.to,
    subject: `Official Registration Confirmed: ${opts.bibNumber} | ${opts.eventTitle}`,
    html,
  });
}

async function main() {
  console.log("Starting manual registration for Harshvardhan Mani Dixit...");

  // 1. Get Event
  const event = await prisma.event.findFirst({
    where: {
      OR: [
        { slug: { contains: "sports" } },
        { title: { contains: "Sports" } },
        { status: "OPEN" }
      ]
    },
    orderBy: { createdAt: "desc" }
  });

  if (!event) {
    throw new Error("Could not find Sports Day Celebration event");
  }
  console.log(`Using Event: "${event.title}" (slug: ${event.slug})`);

  // 2. User
  let user = await prisma.user.findUnique({
    where: { email: RUNNER.email }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: RUNNER.name,
        email: RUNNER.email,
        phone: RUNNER.phone,
        role: "RUNNER"
      }
    });
    console.log(`Created new User: id=${user.id}`);
  } else {
    console.log(`Found existing User: id=${user.id}`);
  }

  // 3. Check existing registration
  const existingReg = await prisma.registration.findFirst({
    where: {
      userId: user.id,
      eventId: event.id
    }
  });

  if (existingReg && existingReg.status === "CONFIRMED") {
    console.log(`User already has confirmed registration: ${existingReg.bibNumber}`);
    return;
  }

  // 4. Generate unique BIB
  const bib = await getUniqueBib(event.slug);
  console.log(`Generated Unique BIB: ${bib}`);

  // 5. Transaction
  const { registration, payment } = await prisma.$transaction(async (tx) => {
    let reg;
    if (existingReg) {
      reg = await tx.registration.update({
        where: { id: existingReg.id },
        data: {
          bibNumber: bib,
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
          adminNote: REGISTRATION_DETAILS.adminNote
        }
      });
    } else {
      reg = await tx.registration.create({
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
          adminNote: REGISTRATION_DETAILS.adminNote
        }
      });
    }

    const pay = await tx.payment.upsert({
      where: { registrationId: reg.id },
      create: {
        registrationId: reg.id,
        razorpayOrderId: `manual_${reg.id}_${Date.now()}`,
        razorpayPaymentId: `manual_upi_200_${Date.now()}`,
        amountInPaise: AMOUNT_PAID_PAISE,
        status: "PAID",
        paidAt: new Date()
      },
      update: {
        razorpayOrderId: `manual_${reg.id}_${Date.now()}`,
        razorpayPaymentId: `manual_upi_200_${Date.now()}`,
        amountInPaise: AMOUNT_PAID_PAISE,
        status: "PAID",
        paidAt: new Date()
      }
    });

    return { registration: reg, payment: pay };
  });

  console.log(`Registration confirmed: id=${registration.id}, BIB=${registration.bibNumber}`);
  console.log(`Payment confirmed: id=${payment.id}, Amount=₹${AMOUNT_PAID_PAISE/100}`);

  // 6. Send email
  try {
    const emailResult = await sendConfirmationEmail({
      to: RUNNER.email,
      runnerName: RUNNER.name,
      eventTitle: event.title,
      distance: REGISTRATION_DETAILS.distance,
      bibNumber: bib,
      amountInPaise: AMOUNT_PAID_PAISE
    });
    console.log(`Email dispatched successfully: id=${emailResult.data?.id}`);
  } catch (err) {
    console.error("Email dispatch notice:", err);
  }

  console.log("\n=================================");
  console.log("REGISTRATION SUMMARY:");
  console.log(`Runner:     ${user.name} (${user.email})`);
  console.log(`Event:      ${event.title}`);
  console.log(`Distance:   ${REGISTRATION_DETAILS.distance}`);
  console.log(`BIB:        ${bib}`);
  console.log(`Paid:       ₹${AMOUNT_PAID_PAISE/100} (Special 50% Off)`);
  console.log(`Status:     CONFIRMED (PAID)`);
  console.log("=================================\n");
}

main().catch(console.error).finally(() => prisma.$disconnect());
