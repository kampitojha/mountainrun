import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname_esm = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname_esm, "../../.env") });

const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: "kampit", mode: "insensitive" } },
        { name: { contains: "Kampit", mode: "insensitive" } },
      ],
    },
    include: {
      registrations: {
        include: {
          event: true,
          certificate: true,
        },
      },
    },
  });
  console.log("KAMPIT_USERS:", JSON.stringify(users, null, 2));

  const certs = await prisma.certificate.findMany({
    take: 5,
    orderBy: { issuedAt: "desc" },
    include: {
      registration: {
        include: { event: true, user: true },
      },
    },
  });
  console.log("RECENT_CERTS:", JSON.stringify(certs.map(c => ({
    certNo: c.certificateNumber,
    bib: c.registration.bibNumber,
    name: c.registration.user.name,
    event: c.registration.event.title,
    pdfUrl: c.pdfUrl,
  })), null, 2));
}

run().finally(() => prisma.$disconnect());
