import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";
import { buildCertificateEmailHtml } from "../services/certificate.service.js";

const __dirname_esm = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname_esm, "../../.env") });

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  console.log("Preparing Test Certificate Email for Kampit Ojha...");

  const data = {
    certificateNumber: "MR-2026-TAR124824",
    runnerName: "Kampit Ojha",
    eventTitle: "Run Your Pride",
    distance: "3 KM",
    bibNumber: "TAR-124824",
    finishTimeLabel: "1D 02:03:00",
    issuedAtLabel: "29 Aug 2026",
    verifyUrl: "https://mountainrun.in/certificates/MR-2026-TAR124824",
  };

  const html = buildCertificateEmailHtml(data);

  console.log("Sending email to itskampitojha@gmail.com...");
  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Mountain Run <certificate@mountainrun.in>",
    to: "itskampitojha@gmail.com",
    subject: "Official Certificate of Achievement 🏆 — Run Your Pride (Mountain Run)",
    html,
  });

  console.log("Email Result:", result);
}

main().catch(console.error);
