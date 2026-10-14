import net from "net";

async function main() {
  const targetHost = "52.76.108.241"; // Neon AWS ap-southeast-1 IPv4
  const targetPort = 5432;
  const localPort = 54341;

  // 1. Start local TCP proxy to bypass ISP DNS issue
  const server = net.createServer((clientSocket) => {
    const upstream = net.connect(targetPort, targetHost, () => {
      clientSocket.pipe(upstream).pipe(clientSocket);
    });
    upstream.on("error", () => clientSocket.destroy());
    clientSocket.on("error", () => upstream.destroy());
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

  const runnerDetails = {
    name: "Srajal Rathore",
    email: "rshashi604@gmail.com",
    phone: "+91 8957898402",
    cleanPhone: "8957898402",
    addressLine1: "Chuka Bagh, Civil Lines",
    addressLine2: "",
    city: "Lalitpur",
    state: "Uttar Pradesh",
    pincode: "284403",
    distance: "10 km",
    finishTimeSeconds: 3385, // 56 mins 25 secs
    eventSlug: "rise-and-run",
  };

  console.log(`\n=============================================================`);
  console.log(`  REGISTERING & ISSUING CERTIFICATE FOR ${runnerDetails.name} `);
  console.log(`  Email: ${runnerDetails.email} | Event: Rise and Run        `);
  console.log(`=============================================================\n`);

  try {
    // 4. Find Event
    const event = await prisma.event.findFirst({
      where: { slug: runnerDetails.eventSlug },
    });

    if (!event) {
      throw new Error(`Event with slug '${runnerDetails.eventSlug}' not found!`);
    }
    console.log(`Found Event: ${event.title} (ID: ${event.id})`);

    // 5. Find or Create User
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: runnerDetails.email, mode: "insensitive" } },
          { phone: { contains: runnerDetails.cleanPhone } },
        ],
      },
    });

    if (!user) {
      console.log(`Creating user record for ${runnerDetails.email}...`);
      user = await prisma.user.create({
        data: {
          name: runnerDetails.name,
          email: runnerDetails.email.toLowerCase().trim(),
          phone: runnerDetails.phone,
          role: "RUNNER",
        },
      });
      console.log(`✓ User created with ID: ${user.id}`);
    } else {
      console.log(`User already exists: ${user.name} (${user.id})`);
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: runnerDetails.name,
          phone: user.phone || runnerDetails.phone,
        },
      });
      console.log(`✓ User profile refreshed`);
    }

    // 6. Check if registration already exists
    let reg = await prisma.registration.findFirst({
      where: {
        userId: user.id,
        eventId: event.id,
      },
      include: {
        proofUpload: true,
        certificate: true,
        medalDelivery: true,
      },
    });

    if (!reg) {
      // Generate unique BIB
      let bib = "";
      while (true) {
        const candidate = `RAR-${Math.floor(100000 + Math.random() * 900000)}`;
        const existing = await prisma.registration.findFirst({
          where: { bibNumber: candidate },
        });
        if (!existing) {
          bib = candidate;
          break;
        }
      }

      console.log(`Creating new Registration with BIB: ${bib}...`);
      reg = await prisma.registration.create({
        data: {
          userId: user.id,
          eventId: event.id,
          bibNumber: bib,
          distance: runnerDetails.distance,
          activityType: "running",
          status: "CONFIRMED",
          proofStatus: "APPROVED",
          finishTimeSeconds: runnerDetails.finishTimeSeconds,
          shippingName: runnerDetails.name,
          shippingPhone: runnerDetails.phone,
          shippingLine1: runnerDetails.addressLine1,
          shippingLine2: runnerDetails.addressLine2,
          shippingCity: runnerDetails.city,
          shippingState: runnerDetails.state,
          shippingPincode: runnerDetails.pincode,
          adminNote:
            "Manual payment verified. Medal already dispatched/delivered to runner. Finisher certificate issued on request.",
        },
        include: {
          proofUpload: true,
          certificate: true,
          medalDelivery: true,
        },
      });
      console.log(`✓ Registration created: ID ${reg.id}, BIB ${reg.bibNumber}`);
    } else {
      console.log(`Registration already exists: ID ${reg.id}, BIB ${reg.bibNumber}`);
      reg = await prisma.registration.update({
        where: { id: reg.id },
        data: {
          status: "CONFIRMED",
          proofStatus: "APPROVED",
          distance: runnerDetails.distance,
          finishTimeSeconds: reg.finishTimeSeconds || runnerDetails.finishTimeSeconds,
          shippingName: runnerDetails.name,
          shippingPhone: runnerDetails.phone,
          shippingLine1: runnerDetails.addressLine1,
          shippingCity: runnerDetails.city,
          shippingState: runnerDetails.state,
          shippingPincode: runnerDetails.pincode,
        },
        include: {
          proofUpload: true,
          certificate: true,
          medalDelivery: true,
        },
      });
      console.log(`✓ Registration updated to CONFIRMED & APPROVED`);
    }

    // 7. Ensure ProofUpload record
    if (!reg.proofUpload) {
      console.log(`Creating approved ProofUpload record...`);
      await prisma.proofUpload.create({
        data: {
          registrationId: reg.id,
          activityImageUrl:
            "https://res.cloudinary.com/yppcqzt6/image/upload/v1788010023/mountainrun/manual_proof.png",
          sourceApp: "Manual Verification",
          status: "APPROVED",
          reviewerNote: "Approved by Admin - Verified Finisher (Manual Submission)",
          reviewedAt: new Date(),
        },
      });
      console.log(`✓ ProofUpload created with status APPROVED`);
    } else {
      await prisma.proofUpload.update({
        where: { registrationId: reg.id },
        data: {
          status: "APPROVED",
          reviewerNote: "Approved by Admin - Verified Finisher (Manual Submission)",
          reviewedAt: new Date(),
        },
      });
      console.log(`✓ ProofUpload verified as APPROVED`);
    }

    // 8. Ensure MedalDelivery record (Status: DELIVERED since user already received it)
    if (!reg.medalDelivery) {
      console.log(`Creating MedalDelivery record as DELIVERED...`);
      await prisma.medalDelivery.create({
        data: {
          registrationId: reg.id,
          status: "DELIVERED",
          deliveredAt: new Date(),
        },
      });
      console.log(`✓ MedalDelivery created with status DELIVERED`);
    } else {
      console.log(`MedalDelivery status: ${reg.medalDelivery.status}`);
    }

    // 9. Ensure & Generate Official Certificate
    console.log(`Ensuring Certificate record...`);
    const certQueued = await ensureCertificateForRegistration(reg.id);
    console.log(`Certificate record queued: ${certQueued.certificateNumber}`);

    console.log(`Generating Certificate data...`);
    const certGenerated = await generateCertificate(certQueued.id);
    console.log(`✓ Certificate generated: ${certGenerated.certificateNumber}`);
    console.log(`   Verification Link: https://mountainrun.in/certificates/${certGenerated.certificateNumber}`);

    // 10. Send Official E-Certificate Email via Resend
    console.log(`\nDispatching official E-Certificate email to ${runnerDetails.email}...`);
    const emailResult = await emailCertificate(certGenerated.id);
    console.log(`✓ Email dispatch result:`, JSON.stringify(emailResult, null, 2));

    console.log(`\n=============================================================`);
    console.log(`🎉 SUCCESS: SRAJAL RATHORE REGISTERED & CERTIFIED!`);
    console.log(`   Athlete Name    : ${runnerDetails.name}`);
    console.log(`   Email           : ${runnerDetails.email}`);
    console.log(`   Event           : Rise and Run`);
    console.log(`   Distance        : ${runnerDetails.distance}`);
    console.log(`   Bib Number      : ${reg.bibNumber}`);
    console.log(`   Finish Time     : 56:25 (${runnerDetails.finishTimeSeconds}s)`);
    console.log(`   Certificate ID  : ${certGenerated.certificateNumber}`);
    console.log(`   Live Portal Link: https://mountainrun.in/certificates/${certGenerated.certificateNumber}`);
    console.log(`=============================================================\n`);

    await prisma.$disconnect();
  } catch (err) {
    console.error("❌ Error in execution:", err);
    throw err;
  } finally {
    server.close();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
