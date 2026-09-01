import { prisma } from "../lib/prisma.js";
import { emailCertificate } from "../services/certificate-issue.service.js";

async function main() {
  console.log("Looking up certificate for SDC-137971...");

  const certificate = await prisma.certificate.findFirst({
    where: {
      OR: [
        { certificateNumber: { contains: "137971", mode: "insensitive" } },
        { registration: { bibNumber: { contains: "137971", mode: "insensitive" } } },
      ],
    },
    include: {
      registration: {
        include: {
          user: true,
          event: true,
        },
      },
    },
  });

  if (!certificate) {
    console.error("❌ Certificate not found for SDC-137971!");
    process.exit(1);
  }

  console.log("Found Certificate:");
  console.log(`  Certificate ID: ${certificate.id}`);
  console.log(`  Certificate Number: ${certificate.certificateNumber}`);
  console.log(`  Runner: ${certificate.registration.user.name} <${certificate.registration.user.email}>`);
  console.log(`  Bib Number: ${certificate.registration.bibNumber}`);
  console.log(`  Event: ${certificate.registration.event.title}`);
  console.log(`  Distance: ${certificate.registration.distance}`);
  console.log(`  Finish Time Seconds: ${certificate.registration.finishTimeSeconds}`);

  console.log("\nSending certificate email via Resend...");
  const result = await emailCertificate(certificate.id);

  console.log("\nResult:", JSON.stringify(result, null, 2));

  if (result.email.sent) {
    console.log("\n✅ Certificate email sent successfully to", certificate.registration.user.email);
  } else {
    console.error("\n❌ Failed to send certificate email:", result.email.error);
    process.exit(1);
  }
}

main()
  .catch((err) => {
    console.error("Execution error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
