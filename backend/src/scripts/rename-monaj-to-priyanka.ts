import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { generateCertificate } from "../services/certificate-issue.service.js";

const __dirname_esm = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname_esm, "../../.env") });

const prisma = new PrismaClient();

async function main() {
  console.log("Searching for Monaj / Manoj Yadav / monajyadav103@gmail.com...");

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: "monajyadav", mode: "insensitive" } },
        { name: { contains: "Monaj", mode: "insensitive" } },
        { name: { contains: "Manoj", mode: "insensitive" } },
      ],
    },
    include: {
      registrations: {
        include: {
          certificate: true,
          event: true,
        },
      },
    },
  });

  console.log(`Found ${users.length} matching users:`);

  for (const user of users) {
    console.log(`Updating User: ID=${user.id}, Old Name='${user.name}', Email='${user.email}' -> 'Priyanka Kumari'`);
    
    // 1. Update User Name
    await prisma.user.update({
      where: { id: user.id },
      data: { name: "Priyanka Kumari" },
    });

    // 2. Update Registrations shippingName
    for (const reg of user.registrations) {
      console.log(`Updating Registration: ID=${reg.id}, Bib=${reg.bibNumber}, Old ShippingName='${reg.shippingName}'`);
      await prisma.registration.update({
        where: { id: reg.id },
        data: {
          shippingName: "Priyanka Kumari",
        },
      });

      // 3. Re-generate / Refresh Certificate
      if (reg.certificate) {
        console.log(`Refreshing Certificate ID=${reg.certificate.id} for Bib=${reg.bibNumber}`);
        await generateCertificate(reg.certificate.id);
      }
    }
  }

  // Also check if any registration has shippingName with Monaj / Manoj
  const regs = await prisma.registration.findMany({
    where: {
      OR: [
        { shippingName: { contains: "Monaj", mode: "insensitive" } },
        { shippingName: { contains: "Manoj", mode: "insensitive" } },
      ],
    },
    include: {
      certificate: true,
      user: true,
    },
  });

  for (const reg of regs) {
    console.log(`Updating remaining Registration shippingName: ${reg.id} (${reg.shippingName}) -> 'Priyanka Kumari'`);
    await prisma.registration.update({
      where: { id: reg.id },
      data: { shippingName: "Priyanka Kumari" },
    });
    await prisma.user.update({
      where: { id: reg.userId },
      data: { name: "Priyanka Kumari" },
    });
    if (reg.certificate) {
      await generateCertificate(reg.certificate.id);
    }
  }

  console.log("SUCCESS: All instances updated to 'Priyanka Kumari'!");
}

main()
  .catch((err) => {
    console.error("Error:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
