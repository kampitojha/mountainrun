import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname_esm = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname_esm, "../../.env") });

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding verified Gandhi Jayanti Certificate for Kampit Ojha...");

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { contains: "kampit", mode: "insensitive" } },
        { name: { contains: "Kampit", mode: "insensitive" } },
      ],
    },
  });

  if (!user) {
    throw new Error("User Kampit not found");
  }

  const event = await prisma.event.findUnique({
    where: { slug: "gandhi-jayanti-victory-run-2026" },
  });

  if (!event) {
    throw new Error("Event gandhi-jayanti-victory-run-2026 not found");
  }

  // Find or update Kampit's Gandhi registration
  let reg = await prisma.registration.findFirst({
    where: {
      userId: user.id,
      eventId: event.id,
    },
  });

  const certNumber = "MR-2026-GJVR-109452";
  const bib = "GJVR-109452";
  const verifyUrl = `https://mountainrun.in/certificates/${certNumber}`;

  if (!reg) {
    console.log("Creating new registration for Kampit...");
    reg = await prisma.registration.create({
      data: {
        bibNumber: bib,
        userId: user.id,
        eventId: event.id,
        distance: "10 km",
        activityType: "running",
        status: "CONFIRMED",
        proofStatus: "APPROVED",
        finishTimeSeconds: 3504,
        shippingName: "Kampit Ojha",
        shippingPhone: user.phone || "+919910533219",
        shippingLine1: "Delhi, North East Delhi",
        shippingCity: "East Delhi",
        shippingState: "Delhi",
        shippingPincode: "110090",
        adminNote: "Test Admin Certificate Entry for Gandhi Jayanti",
      },
    });
  } else {
    console.log("Updating existing registration", reg.id, "to confirmed & bib", bib);
    reg = await prisma.registration.update({
      where: { id: reg.id },
      data: {
        bibNumber: bib,
        status: "CONFIRMED",
        proofStatus: "APPROVED",
        distance: "10 km",
        finishTimeSeconds: 3504,
      },
    });
  }

  const cloudinaryCertUrl = "https://res.cloudinary.com/yppcqzt6/image/upload/v1790861807/mountainrun/certificates/gandhi_cert_kampit_ojha_1790861788.png";

  console.log("Upserting Certificate record...");
  const cert = await prisma.certificate.upsert({
    where: { registrationId: reg.id },
    create: {
      registrationId: reg.id,
      certificateNumber: certNumber,
      pdfUrl: cloudinaryCertUrl,
      qrPayload: JSON.stringify({
        issuer: "Mountain Run",
        certificateNumber: certNumber,
        verifyUrl,
      }),
      status: "GENERATED",
      issuedAt: new Date(),
    },
    update: {
      certificateNumber: certNumber,
      pdfUrl: cloudinaryCertUrl,
      qrPayload: JSON.stringify({
        issuer: "Mountain Run",
        certificateNumber: certNumber,
        verifyUrl,
      }),
      status: "GENERATED",
      issuedAt: new Date(),
    },
  });

  console.log("✓ Certificate successfully saved in DB!");
  console.log("  Certificate Number:", cert.certificateNumber);
  console.log("  BIB Number:", reg.bibNumber);
  console.log("  Public URL:", cert.pdfUrl);
  console.log("  Athlete:", reg.shippingName || user.name);
  console.log("  Event:", event.title);
  console.log("  Distance:", reg.distance);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
