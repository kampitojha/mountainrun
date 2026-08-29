import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { sendMedalDispatchEmail, type MedalDispatchEmailPayload } from "../services/email.service.js";

const __dirname_esm = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname_esm, "../../.env") });

const prisma = new PrismaClient();

function resolveTrackingUrl(courier: string, trackingNumber: string): string {
  const c = courier.toLowerCase().trim();
  if (c.includes("delhivery")) {
    return `https://www.delhivery.com/track/package/${encodeURIComponent(trackingNumber.trim())}`;
  }
  if (c.includes("dtdc")) {
    return "https://www.dtdc.com/track-your-shipment/";
  }
  return "https://www.delhivery.com/tracking";
}

async function main() {
  const jsonPath = path.resolve(__dirname_esm, "../../../pending_medals_data.json");
  const dataRaw = fs.readFileSync(jsonPath, "utf-8");
  const records = JSON.parse(dataRaw);

  console.log(`Loaded ${records.length} records from pending_medals_data.json`);

  const matched = [];

  for (const item of records) {
    const phoneClean = item.mobile ? String(item.mobile).slice(-10) : "";
    
    const orConditions: any[] = [
      { user: { name: { equals: item.name, mode: "insensitive" } } },
      { shippingName: { equals: item.recipient, mode: "insensitive" } },
    ];
    if (phoneClean) {
      orConditions.push({ user: { phone: { contains: phoneClean } } });
      orConditions.push({ shippingPhone: { contains: phoneClean } });
    }

    const reg = await prisma.registration.findFirst({
      where: {
        OR: orConditions,
      },
      include: {
        user: true,
        event: true,
        medalDelivery: true,
      },
      orderBy: { registeredAt: "desc" },
    });

    if (reg) {
      matched.push({
        excelItem: item,
        registration: reg,
        trackingUrl: resolveTrackingUrl(item.courier, item.tracking),
      });
      console.log(`[OK] Row ${item.s_no}: ${item.name} -> User: ${reg.user.name} (${reg.user.email}) | Bib: ${reg.bibNumber} | Event: ${reg.event.title} | Courier: ${item.courier} | Track: ${item.tracking}`);
    } else {
      console.log(`[MISSING] Row ${item.s_no}: ${item.name} (${item.mobile})`);
    }
  }

  console.log(`\nTotal matched in DB: ${matched.length} / ${records.length}`);

  // Send ONE test email to itskampitojha@gmail.com using the first runner's details
  if (matched.length > 0) {
    const sample = matched[0];
    const testEmailPayload: MedalDispatchEmailPayload = {
      to: "itskampitojha@gmail.com",
      runnerName: sample.registration.user.name,
      eventTitle: sample.registration.event.title,
      bibNumber: sample.registration.bibNumber,
      distance: sample.registration.distance,
      courier: sample.excelItem.courier.trim().toUpperCase().includes("DELHIVERY") ? "Delhivery Express" : "DTDC Courier",
      trackingNumber: sample.excelItem.tracking,
      trackingUrl: sample.trackingUrl,
      shippingLine1: sample.excelItem.address,
      shippingCity: sample.excelItem.city,
      shippingState: sample.excelItem.state,
      shippingPincode: sample.excelItem.pincode,
    };

    console.log("\nSending TEST email to itskampitojha@gmail.com with sample data:");
    console.log(testEmailPayload);
    const result = await sendMedalDispatchEmail(testEmailPayload);
    console.log("Test email result:", result);
  }
}

main()
  .catch((err) => {
    console.error("Error running script:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
