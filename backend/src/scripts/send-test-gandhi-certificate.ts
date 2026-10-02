import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { Resend } from "resend";
import { buildCertificateEmailHtml } from "../services/certificate.service.js";

const __dirname_esm = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname_esm, "../../.env") });

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  console.log("Preparing Test Gandhi Jayanti Certificate Email for Kampit Ojha...");

  const data = {
    certificateNumber: "MR-2026-GJVR-109452",
    runnerName: "Kampit Ojha",
    eventTitle: "Gandhi Jayanti Victory Run 2026",
    distance: "10 KM",
    bibNumber: "GJVR-109452",
    finishTimeLabel: "00:58:24",
    issuedAtLabel: "02 Oct 2026",
    verifyUrl: "https://mountainrun.in/certificates/MR-2026-GJVR-109452",
  };

  const html = buildCertificateEmailHtml(data);

  // Save local preview
  const previewPath = path.resolve(__dirname_esm, "../../../gandhi-certificate-preview.html");
  fs.writeFileSync(previewPath, html, "utf-8");
  console.log(`Saved local preview to ${previewPath}`);

  console.log("Loading certificate attachment from assets...");
  const certAttachmentPath = path.resolve(__dirname_esm, "../../../backend/assets/kampit_gandhi_certificate_master.png");
  const attachments = fs.existsSync(certAttachmentPath)
    ? [
        {
          filename: `MountainRun_Gandhi_Jayanti_Certificate_${data.bibNumber}.png`,
          content: fs.readFileSync(certAttachmentPath),
        },
      ]
    : [];

  console.log("Sending email to itskampitojha@gmail.com via Resend...");
  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Mountain Run <onboarding@mountainrun.in>",
    to: "itskampitojha@gmail.com",
    replyTo: "mountainrunofficial@gmail.com",
    subject: "Official Certificate of Participation 🏆 — Gandhi Jayanti Victory Run 2026 | Mountain Run",
    html,
    attachments,
  });

  console.log("Resend Result:", JSON.stringify(result, null, 2));
}

main().catch(console.error);
