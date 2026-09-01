import { prisma } from "../lib/prisma.js";
import { generateCertificate, emailCertificate } from "../services/certificate-issue.service.js";

async function main() {
  console.log("=== UPDATING CERTIFICATE & RESENDING FOR SDC-410349 ===");

  const bibNumber = "SDC-410349";
  const newName = "Shivanshu Vyas";

  // 1. Find registration
  const registration = await prisma.registration.findFirst({
    where: {
      bibNumber: { contains: "410349", mode: "insensitive" },
    },
    include: {
      user: true,
      event: true,
      certificate: true,
    },
  });

  if (!registration) {
    console.error("❌ Registration not found for SDC-410349!");
    process.exit(1);
  }

  console.log(`Found Registration:`);
  console.log(`  Registration ID: ${registration.id}`);
  console.log(`  Bib Number     : ${registration.bibNumber}`);
  console.log(`  Current User   : ${registration.user.name} (${registration.user.email})`);
  console.log(`  Shipping Name  : ${registration.shippingName}`);
  console.log(`  Event          : ${registration.event.title}`);
  console.log(`  Distance       : ${registration.distance}`);

  // 2. Update User Name and Registration shippingName
  console.log(`\nUpdating User.name -> '${newName}'...`);
  await prisma.user.update({
    where: { id: registration.userId },
    data: { name: newName },
  });

  console.log(`Updating Registration.shippingName -> '${newName}'...`);
  await prisma.registration.update({
    where: { id: registration.id },
    data: { shippingName: newName },
  });

  // 3. Ensure and refresh certificate
  let certId = registration.certificate?.id;
  if (!certId) {
    const certNumber = `MR-2026-${registration.bibNumber.replace(/[^A-Z0-9]/gi, "")}`;
    const newCert = await prisma.certificate.create({
      data: {
        registrationId: registration.id,
        certificateNumber: certNumber,
        qrPayload: JSON.stringify({ issuer: "Mountain Run", certificateNumber: certNumber }),
        status: "GENERATED",
      },
    });
    certId = newCert.id;
  }

  console.log(`Regenerating certificate (ID: ${certId})...`);
  await generateCertificate(certId);

  // 4. Send Certificate Email
  console.log(`Sending updated certificate email to ${registration.user.email}...`);
  const emailRes = await emailCertificate(certId);

  console.log("\nEmail result:", JSON.stringify(emailRes, null, 2));

  if (emailRes.email.sent) {
    console.log(`\n✅ SUCCESS: Certificate updated to '${newName}' and emailed to ${registration.user.email}!`);
    console.log(`Public Certificate Link: https://mountainrun.in/certificates/MR-2026-SDC410349`);
  } else {
    console.error(`\n⚠️ Certificate updated in DB, but email sending failed:`, emailRes.email.error);
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
