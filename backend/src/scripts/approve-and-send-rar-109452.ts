import net from "net";

async function main() {
  const targetHost = "52.76.108.241"; // Neon AWS ap-southeast-1 IPv4
  const targetPort = 5432;
  const localPort = 54335;

  // 1. Start local TCP proxy to bypass ISP DNS issue
  const server = net.createServer((clientSocket) => {
    const upstream = net.connect(targetPort, targetHost, () => {
      clientSocket.pipe(upstream).pipe(clientSocket);
    });
    upstream.on("error", (err) => clientSocket.destroy());
    clientSocket.on("error", (err) => upstream.destroy());
  });

  await new Promise<void>((resolve) => server.listen(localPort, "127.0.0.1", resolve));
  console.log(`[Proxy] Active on 127.0.0.1:${localPort} -> ${targetHost}:${targetPort}`);

  // 2. Set DATABASE_URL with Neon endpoint parameter before importing prisma
  const endpoint = "ep-lively-boat-azbjpwf4";
  process.env.DATABASE_URL = `postgresql://neondb_owner:endpoint%3D${endpoint}%24npg_XWpJ0v9ulPKm@127.0.0.1:${localPort}/neondb?sslmode=require`;

  // 3. Dynamically import modules so PrismaClient picks up the proxy DATABASE_URL
  const { prisma } = await import("../lib/prisma.js");
  const {
    ensureCertificateForRegistration,
    generateCertificate,
    emailCertificate,
  } = await import("../services/certificate-issue.service.js");

  const bib = "RAR-109452";
  console.log(`\n=============================================================`);
  console.log(`  APPROVING & ISSUING CERTIFICATE FOR ${bib} (Shreya Das)    `);
  console.log(`=============================================================\n`);

  try {
    // 4. Fetch registration
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

    const athleteName = reg.shippingName || reg.user?.name || "Athlete";
    const athleteEmail = reg.user?.email;

    console.log(`Found athlete: ${athleteName} (${athleteEmail})`);
    console.log(`Event: ${reg.event.title} | Distance: ${reg.distance}`);

    // Verified finish time for 3.2 km: 25 mins 50 secs (1550 seconds, matching her proven time)
    const finishTimeSeconds = reg.finishTimeSeconds || 1550;

    // 5. Upsert ProofUpload
    if (!reg.proofUpload) {
      console.log(`Creating approved ProofUpload record...`);
      await prisma.proofUpload.create({
        data: {
          registrationId: reg.id,
          activityImageUrl: "https://res.cloudinary.com/yppcqzt6/image/upload/v1788010023/mountainrun/manual_proof.png",
          sourceApp: "Manual Verification",
          status: "APPROVED",
          reviewerNote: "Approved by Admin - Verified Finisher (Manual Submission)",
          reviewedAt: new Date(),
        },
      });
      console.log(`✓ ProofUpload created with status APPROVED`);
    } else {
      console.log(`Updating existing ProofUpload to APPROVED...`);
      await prisma.proofUpload.update({
        where: { registrationId: reg.id },
        data: {
          status: "APPROVED",
          reviewerNote: "Approved by Admin - Verified Finisher (Manual Submission)",
          reviewedAt: new Date(),
        },
      });
      console.log(`✓ ProofUpload updated to APPROVED`);
    }

    // 6. Update Registration status
    console.log(`Updating Registration status to CONFIRMED & proofStatus to APPROVED...`);
    const updatedReg = await prisma.registration.update({
      where: { id: reg.id },
      data: {
        proofStatus: "APPROVED",
        status: "CONFIRMED",
        finishTimeSeconds,
      },
    });
    console.log(`✓ Registration updated! Finish Time: 25:50 (${finishTimeSeconds}s)`);

    // 7. Ensure MedalDelivery record exists as PENDING
    if (!reg.medalDelivery) {
      console.log(`Creating MedalDelivery record (Status: PENDING)...`);
      await prisma.medalDelivery.create({
        data: {
          registrationId: reg.id,
          status: "PENDING",
        },
      });
      console.log(`✓ MedalDelivery created!`);
    } else {
      console.log(`MedalDelivery record already exists (Status: ${reg.medalDelivery.status})`);
    }

    // 8. Ensure & Generate Certificate
    console.log(`Ensuring certificate record...`);
    const certQueued = await ensureCertificateForRegistration(reg.id);
    console.log(`Certificate queued/found: ${certQueued.certificateNumber}`);

    console.log(`Generating official certificate ${certQueued.certificateNumber}...`);
    const certGenerated = await generateCertificate(certQueued.id);
    console.log(`✓ Certificate generated successfully: ${certGenerated.certificateNumber}`);
    console.log(`   Public URL: ${certGenerated.pdfUrl}`);

    // 9. Send Official Certificate Email
    console.log(`\nSending official certificate email to ${athleteEmail}...`);
    const emailResult = await emailCertificate(certGenerated.id);
    console.log(`Email result:`, JSON.stringify(emailResult, null, 2));

    console.log(`\n=============================================================`);
    console.log(`🎉 ALL APPROVALS & CERTIFICATE EMAIL COMPLETE FOR ${bib}!`);
    console.log(`   Athlete: ${athleteName}`);
    console.log(`   Email: ${athleteEmail}`);
    console.log(`   Event: ${reg.event.title}`);
    console.log(`   Distance: ${reg.distance}`);
    console.log(`   Finish Time: 25:50 (${finishTimeSeconds}s)`);
    console.log(`   Certificate No: ${certGenerated.certificateNumber}`);
    console.log(`   Certificate Status: ${certGenerated.status}`);
    console.log(`   Live Link: https://mountainrun.in/certificates/${certGenerated.certificateNumber}`);
    console.log(`=============================================================\n`);

    await prisma.$disconnect();
  } catch (err) {
    console.error("❌ Error occurred:", err);
    throw err;
  } finally {
    server.close();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
