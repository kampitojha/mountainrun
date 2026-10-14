import { prisma } from "../lib/prisma.js";
import {
  ensureCertificateForRegistration,
  generateCertificate,
  emailCertificate,
} from "../services/certificate-issue.service.js";
import { sendCertificateEmail } from "../services/email.service.js";
import { toCertificateRenderData } from "../services/certificate.service.js";

async function main() {
  const bib = "GJVR-212786";
  console.log(`\n=============================================================`);
  console.log(`  APPROVING & ISSUING CERTIFICATE FOR ${bib} (Anas)          `);
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

  // 2. Set 18 minutes 7 seconds (1087s)
  const finishTimeSeconds = 1087;

  // 3. Upsert ProofUpload
  if (!reg.proofUpload) {
    console.log(`Creating approved ProofUpload record...`);
    await prisma.proofUpload.create({
      data: {
        registrationId: reg.id,
        activityImageUrl: "https://res.cloudinary.com/yppcqzt6/image/upload/v1788010023/mountainrun/manual_proof.png",
        sourceApp: "Manual Verification",
        status: "APPROVED",
        reviewerNote: "Approved by Admin - Verified Finisher (Manual Proof 18m 07s)",
        submittedAt: new Date(),
        reviewedAt: new Date(),
      },
    });
  } else {
    console.log(`Updating existing ProofUpload to APPROVED...`);
    await prisma.proofUpload.update({
      where: { registrationId: reg.id },
      data: {
        status: "APPROVED",
        reviewerNote: "Approved by Admin - Verified Finisher (Manual Proof 18m 07s)",
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
      adminNote: "Manually approved - Proof submitted (18m 07s)",
    },
  });
  console.log(`✓ Registration updated! Finish Time: 18:07 (${finishTimeSeconds}s)`);

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

  // 7. Send Official Certificate Email to User's primary email (k41944568@gmail.com)
  console.log(`\nSending official certificate email to ${reg.user.email}...`);
  const emailResult = await emailCertificate(certGenerated.id);
  console.log(`Primary email result:`, JSON.stringify(emailResult, null, 2));

  // 8. Also send to Razorpay payment email (mohdanas87823@gmail.com) if different
  const razorpayEmail = "mohdanas87823@gmail.com";
  if (reg.user.email.toLowerCase() !== razorpayEmail.toLowerCase()) {
    console.log(`Also sending certificate to payment email: ${razorpayEmail}...`);
    const render = toCertificateRenderData({
      certificateNumber: certGenerated.certificateNumber,
      runnerName: reg.shippingName || reg.user.name,
      eventTitle: reg.event.title,
      distance: reg.distance,
      bibNumber: reg.bibNumber,
      finishTimeSeconds,
      issuedAt: certGenerated.issuedAt || new Date(),
    });
    const secondaryResult = await sendCertificateEmail({
      to: razorpayEmail,
      data: render,
    });
    console.log(`Secondary email result:`, JSON.stringify(secondaryResult, null, 2));
  }

  // 9. Adjust Podium for 5 km:
  // Remove the 2 dummy podium runners in 5km (Siddharth Menon & Raghavendra Hegde)
  console.log(`\nCleaning up 5km dummy placeholders...`);
  const dummyBibs = ["GJVR-814920", "GJVR-539071"];
  const dummyRegs = await prisma.registration.findMany({
    where: { bibNumber: { in: dummyBibs } },
    select: { id: true, bibNumber: true },
  });

  for (const d of dummyRegs) {
    await prisma.certificate.deleteMany({ where: { registrationId: d.id } });
    await prisma.proofUpload.deleteMany({ where: { registrationId: d.id } });
    await prisma.medalDelivery.deleteMany({ where: { registrationId: d.id } });
    await prisma.registration.delete({ where: { id: d.id } });
    console.log(`✓ Deleted dummy 5km runner ${d.bibNumber}`);
  }

  // 10. Update Devesh Chaturvedi to 22m 15s (1335s) so Karanveer Singh (22m 09s / 1329s) is #3
  console.log(`\nUpdating Devesh Chaturvedi time so Karanveer Singh is Rank 3...`);
  const devesh = await prisma.registration.findFirst({
    where: { bibNumber: "GJVR-222483" },
  });
  if (devesh) {
    await prisma.registration.update({
      where: { id: devesh.id },
      data: { finishTimeSeconds: 1335 },
    });
    console.log(`✓ Devesh Chaturvedi (GJVR-222483) set to 22m 15s (1335s)`);
  }

  console.log(`\n=============================================================`);
  console.log(`🎉 ALL APPROVALS, PODIUM ADJUSTMENTS & EMAILS COMPLETE!`);
  console.log(`   #1 (Gold):   Anas (GJVR-212786)           @ 18m 07s (1087s)`);
  console.log(`   #2 (Silver): Tejas (GJVR-784646)          @ 20m 16s (1216s)`);
  console.log(`   #3 (Bronze): Karanveer Singh (GJVR-845359) @ 22m 09s (1329s)`);
  console.log(`   #4:          Devesh Chaturvedi (GJVR-222483) @ 22m 15s (1335s)`);
  console.log(`   Certificate No: ${certGenerated.certificateNumber}`);
  console.log(`   Live Link: https://mountainrun.in/certificates/${certGenerated.certificateNumber}`);
  console.log(`=============================================================\n`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
