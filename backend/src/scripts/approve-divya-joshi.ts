import { prisma } from "../lib/prisma.js";
import {
  ensureCertificateForRegistration,
  generateCertificate,
  emailCertificate,
} from "../services/certificate-issue.service.js";

async function main() {
  const bib = "RAR-591008";
  console.log(`\n=============================================================`);
  console.log(`  APPROVING & ISSUING CERTIFICATE FOR ${bib} (Divya Joshi)   `);
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

  // 2. Verified finish time from Strava screenshot: 2:40:22 (9622 seconds)
  const finishTimeSeconds = 9622;
  const proofUrls = [
    "https://res.cloudinary.com/yppcqzt6/image/upload/v1789399554/mountainrun/proofs/acggiwcdflirmo401jdr.jpg",
    "https://res.cloudinary.com/yppcqzt6/image/upload/v1789399557/mountainrun/proofs/j5nb7hsjp7kmjpxugoao.jpg",
    "https://res.cloudinary.com/yppcqzt6/image/upload/v1789399559/mountainrun/proofs/xwwc99x0ihlry91xhgmp.jpg",
    "https://res.cloudinary.com/yppcqzt6/image/upload/v1789399562/mountainrun/proofs/h93hhfvcvtewcjhnm8ks.jpg",
  ];

  // 3. Upsert ProofUpload
  if (!reg.proofUpload) {
    console.log(`Creating approved ProofUpload record...`);
    await prisma.proofUpload.create({
      data: {
        registrationId: reg.id,
        activityImageUrl: JSON.stringify(proofUrls),
        sourceApp: "Strava",
        status: "APPROVED",
        reviewerNote: "Verified 21.13 km finisher from Strava proof (Moving Time 2:40:22)",
        reviewedAt: new Date(),
      },
    });
  } else {
    console.log(`Updating existing ProofUpload to APPROVED...`);
    await prisma.proofUpload.update({
      where: { registrationId: reg.id },
      data: {
        activityImageUrl: JSON.stringify(proofUrls),
        sourceApp: "Strava",
        status: "APPROVED",
        reviewerNote: "Verified 21.13 km finisher from Strava proof (Moving Time 2:40:22)",
        reviewedAt: new Date(),
      },
    });
  }

  // 4. Update Registration
  console.log(`Updating Registration status to CONFIRMED & proofStatus to APPROVED...`);
  const updatedReg = await prisma.registration.update({
    where: { id: reg.id },
    data: {
      proofStatus: "APPROVED",
      status: "CONFIRMED",
      finishTimeSeconds,
    },
  });
  console.log(`✓ Registration updated! Finish Time: 02:40:22 (${finishTimeSeconds}s)`);

  // 5. Ensure MedalDelivery record exists as PENDING
  if (!reg.medalDelivery && reg.event.medalIncluded) {
    console.log(`Creating MedalDelivery record (Status: PENDING)...`);
    await prisma.medalDelivery.create({
      data: {
        registrationId: reg.id,
        status: "PENDING",
      },
    });
    console.log(`✓ MedalDelivery created!`);
  } else if (!reg.medalDelivery) {
    console.log(`Creating MedalDelivery record as PENDING...`);
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
  try {
    const emailResult = await emailCertificate(certGenerated.id);
    console.log(`Email result:`, JSON.stringify(emailResult, null, 2));
  } catch (emailErr) {
    console.warn(`Email sending notice:`, emailErr);
  }

  console.log(`\n=============================================================`);
  console.log(`🎉 ALL APPROVALS & CERTIFICATE GENERATION COMPLETE FOR ${bib}!`);
  console.log(`   Athlete: ${reg.shippingName || reg.user.name}`);
  console.log(`   Email: ${reg.user.email}`);
  console.log(`   Distance: 21 km`);
  console.log(`   Finish Time: 02:40:22`);
  console.log(`   Certificate No: ${certGenerated.certificateNumber}`);
  console.log(`   Live Link: https://mountainrun.in/certificates/${certGenerated.certificateNumber}`);
  console.log(`=============================================================\n`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
