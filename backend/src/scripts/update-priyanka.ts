import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  createCertificateNumber,
  createCertificateQrPayload,
  buildCertificatePublicUrl,
  toCertificateRenderData,
} from "../services/certificate.service.js";
import { sendCertificateEmail } from "../services/email.service.js";

const __dirname_esm = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname_esm, "../../.env") });

const prisma = new PrismaClient();

async function main() {
  const bibNumber = "IDVR-662712";
  const finishTimeSeconds = 32 * 60 + 37; // 1957 seconds = 32 mins 37 secs

  console.log(`Updating finish time for ${bibNumber} to ${finishTimeSeconds} seconds (32:37)...`);

  const reg = await prisma.registration.findUnique({
    where: { bibNumber },
    include: {
      user: true,
      event: true,
      certificate: true,
    },
  });

  if (!reg) {
    throw new Error(`Registration not found for ${bibNumber}`);
  }

  // 1. Update finishTimeSeconds in Registration
  const updatedReg = await prisma.registration.update({
    where: { id: reg.id },
    data: {
      finishTimeSeconds,
    },
    include: {
      user: true,
      event: true,
      certificate: true,
    },
  });

  console.log(`✓ Registration finishTimeSeconds updated to: ${updatedReg.finishTimeSeconds}`);

  // 2. Format render data with timing
  const certNumber = reg.certificate?.certificateNumber || createCertificateNumber(bibNumber);
  const renderData = toCertificateRenderData({
    certificateNumber: certNumber,
    runnerName: updatedReg.user.name,
    eventTitle: updatedReg.event.title,
    distance: updatedReg.distance,
    bibNumber: updatedReg.bibNumber,
    finishTimeSeconds: updatedReg.finishTimeSeconds,
    issuedAt: updatedReg.certificate?.issuedAt || new Date(),
  });

  console.log("Certificate Render Data:", renderData);

  // 3. Send updated Certificate Email
  const certEmailResult = await sendCertificateEmail({
    to: updatedReg.user.email,
    data: renderData,
  });

  console.log(`✓ Updated certificate email sent to ${updatedReg.user.email}:`, certEmailResult);
}

main()
  .catch((err) => {
    console.error("Error executing script:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
