import { prisma } from "../lib/prisma.js";
import {
  ensureCertificateForRegistration,
  generateCertificate,
  emailCertificate,
} from "../services/certificate-issue.service.js";

async function main() {
  const bib = "IDVR-348713";
  console.log(`\n=============================================================`);
  console.log(`  APPROVING & ISSUING CERTIFICATE FOR ${bib} (Arudra Srinivasa Chary) `);
  console.log(`=============================================================\n`);

  // 1. Fetch registration
  const reg = await prisma.registration.findFirst({
    where: { bibNumber: bib },
    include: {
      user: true,
      event: true,
      proofUpload: true,
      certificate: true,
      medalDelivery: true,
    },
  });

  if (!reg) {
    console.error(`❌ Registration with BIB ${bib} not found!`);
    process.exit(1);
  }

  console.log(`Found athlete: ${reg.shippingName || reg.user.name} (${reg.user.email})`);
  console.log(`Event: ${reg.event.title} | Distance: ${reg.distance}`);

  // 2. Verified finish time for 5 km: 28 mins 15 secs (1695s)
  const finishTimeSeconds = reg.finishTimeSeconds || 1695;

  // 3. Upsert ProofUpload
  if (!reg.proofUpload) {
    console.log(`Creating approved ProofUpload record...`);
    await prisma.proofUpload.create({
      data: {
        registrationId: reg.id,
        activityImageUrl: "https://res.cloudinary.com/yppcqzt6/image/upload/v1788010023/mountainrun/manual_proof.png",
        sourceApp: "Manual Verification",
        status: "APPROVED",
        reviewerNote: "Approved by Admin - Verified Finisher",
        reviewedAt: new Date(),
      },
    });
  } else {
    console.log(`Updating existing ProofUpload to APPROVED...`);
    await prisma.proofUpload.update({
      where: { registrationId: reg.id },
      data: {
        status: "APPROVED",
        reviewerNote: "Approved by Admin - Verified Finisher",
        reviewedAt: new Date(),
      },
    });
  }

  // 4. Update Registration
  console.log(`Updating Registration status to CONFIRMED & proofStatus to APPROVED...`);
  await prisma.registration.update({
    where: { id: reg.id },
    data: {
      proofStatus: "APPROVED",
      status: "CONFIRMED",
      finishTimeSeconds,
    },
  });
  console.log(`✓ Registration updated! Finish Time: 28:15 (${finishTimeSeconds}s)`);

  // 5. Ensure MedalDelivery record exists as PENDING
  if (!reg.medalDelivery) {
    console.log(`Creating MedalDelivery record (Status: PENDING)...`);
    await prisma.medalDelivery.create({
      data: {
        registrationId: reg.id,
        status: "PENDING",
      },
    });
    console.log(`✓ MedalDelivery created!`);
  }

  // 6. Ensure & Generate Certificate
  console.log(`Ensuring certificate record...`);
  const certQueued = await ensureCertificateForRegistration(reg.id);
  console.log(`Generating official certificate ${certQueued.certificateNumber}...`);
  const certGenerated = await generateCertificate(certQueued.id);
  console.log(`✓ Certificate generated successfully: ${certGenerated.certificateNumber}`);
  console.log(`   Public URL: ${certGenerated.pdfUrl}`);

  // 7. Send Official Certificate Email
  console.log(`\nSending official certificate email to ${reg.user.email}...`);
  const emailResult = await emailCertificate(certGenerated.id);
  console.log(`Email result:`, JSON.stringify(emailResult, null, 2));

  console.log(`\n=============================================================`);
  console.log(`🎉 ALL APPROVALS & CERTIFICATE EMAIL COMPLETE FOR ${bib}!`);
  console.log(`   Athlete: ${reg.shippingName || reg.user.name}`);
  console.log(`   Email: ${reg.user.email}`);
  console.log(`   Certificate No: ${certGenerated.certificateNumber}`);
  console.log(`   Live Link: https://mountainrun.in/certificates/${certGenerated.certificateNumber}`);
  console.log(`=============================================================\n`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
