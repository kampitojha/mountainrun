import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";
import { buildCertificateEmailHtml } from "../services/certificate.service.js";
import { buildMedalDispatchHtml } from "../services/email.service.js";

const __dirname_esm = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname_esm, "../../.env") });

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  const recipientEmail = "itskampitojha@gmail.com";
  console.log(`Sending Full Sports Day Celebration Test Emails to ${recipientEmail}...\n`);

  // 1. Certificate Email
  const certData = {
    certificateNumber: "MR-2026-SDC124824",
    runnerName: "Kampit Ojha",
    eventTitle: "Sports Day Celebration",
    distance: "5 KM",
    bibNumber: "SDC-124824",
    finishTimeLabel: "1D 02:03:00",
    issuedAtLabel: "29 Aug 2026",
    verifyUrl: "https://mountainrun.in/certificates/SDC-124824",
  };

  const certHtml = buildCertificateEmailHtml(certData);

  console.log("1. Sending Luxury Certificate Email...");
  const certResult = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Mountain Run <certificate@mountainrun.in>",
    to: recipientEmail,
    subject: "Official Certificate of Achievement 🏆 — Sports Day Celebration (Mountain Run)",
    html: certHtml,
  });
  console.log("Certificate Email Result ID:", certResult.data?.id, "Error:", certResult.error);

  // 2. Medal Dispatch Email
  const dispatchPayload = {
    to: recipientEmail,
    runnerName: "Kampit Ojha",
    eventTitle: "Sports Day Celebration",
    distance: "5 KM",
    bibNumber: "SDC-124824",
    courier: "Delhivery Express",
    trackingNumber: "39879816159786",
    trackingUrl: "https://www.delhivery.com/track/package/39879816159786",
    shippingLine1: "Mountain Run Headquarters, Connaught Place",
    shippingCity: "New Delhi",
    shippingState: "Delhi",
    shippingPincode: "110001",
  };

  const dispatchHtml = buildMedalDispatchHtml(dispatchPayload);

  console.log("\n2. Sending Medal Dispatch Notification Email...");
  const dispatchResult = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Mountain Run <certificate@mountainrun.in>",
    to: recipientEmail,
    subject: "🏅 Your Finisher Medal has been Dispatched! — Sports Day Celebration",
    html: dispatchHtml,
  });
  console.log("Medal Dispatch Email Result ID:", dispatchResult.data?.id, "Error:", dispatchResult.error);

  console.log("\n=======================================================");
  console.log("ALL TEST EMAILS SENT SUCCESSFULLY TO itskampitojha@gmail.com! 🎉");
  console.log("=======================================================");
}

main().catch(console.error);
