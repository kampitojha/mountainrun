import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  createCertificateQrPayload,
  buildCertificatePublicUrl,
} from "../services/certificate.service.js";

const __dirname_esm = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname_esm, "../../.env") });

const prisma = new PrismaClient();

async function main() {
  console.log("Creating/updating real test record for Kampit Ojha in Sports Day Celebration...");

  // 1. Find the Sports Day Celebration event
  let event = await prisma.event.findFirst({
    where: {
      OR: [
        { slug: "sports-day-celebration" },
        { title: { contains: "Sports Day", mode: "insensitive" } },
      ],
    },
  });

  if (!event) {
    // Fallback to any active event
    event = await prisma.event.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }

  if (!event) {
    throw new Error("No active event found in database to attach registration to.");
  }

  console.log(`Using Event: ${event.title} (ID: ${event.id}, Slug: ${event.slug})`);

  // 2. Upsert User
  const email = "itskampitojha@gmail.com";
  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: "Kampit Ojha",
      phone: "9999999999",
      role: "ADMIN",
    },
    update: {
      name: "Kampit Ojha",
      role: "ADMIN",
    },
  });

  console.log(`User confirmed: ${user.name} (${user.email}, ID: ${user.id})`);

  // 3. Upsert Registration
  const bibNumber = "SDC-124824";
  const distance = "5 km";
  const finishTimeSeconds = 86400 + 2 * 3600 + 3 * 60; // 1D 02:03:00 = 93780s

  const registration = await prisma.registration.upsert({
    where: { bibNumber },
    create: {
      bibNumber,
      userId: user.id,
      eventId: event.id,
      distance,
      status: "CONFIRMED",
      proofStatus: "APPROVED",
      finishTimeSeconds,
      shippingName: "Kampit Ojha",
      shippingPhone: "9999999999",
      shippingLine1: "Mountain Run Headquarters, Connaught Place",
      shippingCity: "New Delhi",
      shippingState: "Delhi",
      shippingPincode: "110001",
      registeredAt: new Date(),
    },
    update: {
      userId: user.id,
      eventId: event.id,
      distance,
      status: "CONFIRMED",
      proofStatus: "APPROVED",
      finishTimeSeconds,
      shippingName: "Kampit Ojha",
    },
  });

  console.log(`Registration confirmed: Bib=${registration.bibNumber}, Distance=${registration.distance}`);

  // 4. Create / Update Certificate
  const certificateNumber = "MR-2026-TAR124824";
  const publicUrl = `https://mountainrun.in/certificates/${certificateNumber}`;

  const cert = await prisma.certificate.upsert({
    where: { registrationId: registration.id },
    create: {
      registrationId: registration.id,
      certificateNumber,
      status: "GENERATED",
      pdfUrl: publicUrl,
      qrPayload: createCertificateQrPayload(certificateNumber),
      issuedAt: new Date(),
    },
    update: {
      certificateNumber,
      status: "GENERATED",
      pdfUrl: publicUrl,
      qrPayload: createCertificateQrPayload(certificateNumber),
      issuedAt: new Date(),
    },
  });

  console.log(`Certificate confirmed: ${cert.certificateNumber} (Status: ${cert.status})`);

  // 5. Medal Delivery Record
  await prisma.medalDelivery.upsert({
    where: { registrationId: registration.id },
    create: {
      registrationId: registration.id,
      status: "DISPATCHED",
      courier: "Delhivery Express",
      trackingNumber: "39879816159786",
      trackingUrl: "https://www.delhivery.com/track/package/39879816159786",
      dispatchedAt: new Date(),
    },
    update: {
      status: "DISPATCHED",
      courier: "Delhivery Express",
      trackingNumber: "39879816159786",
      trackingUrl: "https://www.delhivery.com/track/package/39879816159786",
      dispatchedAt: new Date(),
    },
  });

  console.log("\n==========================================");
  console.log("REAL TEST RECORD CREATED SUCCESSFULLY! 🎉");
  console.log("==========================================");
  console.log("Runner Name       :", user.name);
  console.log("Event             :", event.title);
  console.log("Distance          :", registration.distance);
  console.log("Bib Number        :", registration.bibNumber);
  console.log("Certificate ID    :", cert.certificateNumber);
  console.log("Live Certificate  :", `https://mountainrun.in/certificates/${cert.certificateNumber}`);
  console.log("Alternative Bib   :", `https://mountainrun.in/certificates/${registration.bibNumber}`);
  console.log("Live Medal Tracker:", `https://mountainrun.in/prize/${registration.bibNumber}`);
  console.log("==========================================");
}

main()
  .catch((err) => {
    console.error("Error creating test record:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
