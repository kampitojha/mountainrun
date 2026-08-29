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

export async function dispatchAllMedals() {
  const jsonPath = path.resolve(__dirname_esm, "../../../pending_medals_data.json");
  const dataRaw = fs.readFileSync(jsonPath, "utf-8");
  const records = JSON.parse(dataRaw);

  console.log(`Starting dispatch for ${records.length} pending runners...`);

  const results = [];

  for (const item of records) {
    const phoneClean = item.mobile ? String(item.mobile).slice(-10) : "";
    
    const orConditions: any[] = [
      { user: { name: { equals: item.name, mode: "insensitive" as const } } },
      { shippingName: { equals: item.recipient, mode: "insensitive" as const } },
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

    if (!reg) {
      console.error(`[ERROR] Could not find DB registration for ${item.name} (${item.mobile})`);
      results.push({ item, status: "NOT_FOUND" });
      continue;
    }

    const trackingUrl = resolveTrackingUrl(item.courier, item.tracking);
    const courierFormatted = item.courier.trim().toUpperCase().includes("DELHIVERY")
      ? "Delhivery Express"
      : "DTDC Courier";

    // 1. Update Database MedalDelivery
    await prisma.medalDelivery.upsert({
      where: { registrationId: reg.id },
      create: {
        registrationId: reg.id,
        status: "DISPATCHED",
        trackingNumber: item.tracking,
        courier: courierFormatted,
        trackingUrl,
        dispatchedAt: new Date(),
      },
      update: {
        status: "DISPATCHED",
        trackingNumber: item.tracking,
        courier: courierFormatted,
        trackingUrl,
        dispatchedAt: new Date(),
      },
    });

    // 2. Send Email to Runner
    const emailPayload: MedalDispatchEmailPayload = {
      to: reg.user.email,
      runnerName: reg.user.name,
      eventTitle: reg.event.title,
      bibNumber: reg.bibNumber,
      distance: reg.distance,
      courier: courierFormatted,
      trackingNumber: item.tracking,
      trackingUrl,
      shippingLine1: item.address || reg.shippingLine1,
      shippingCity: item.city || reg.shippingCity,
      shippingState: item.state || reg.shippingState,
      shippingPincode: item.pincode || reg.shippingPincode,
    };

    const emailRes = await sendMedalDispatchEmail(emailPayload);

    // 3. Notification entry in DB
    await prisma.notification.create({
      data: {
        userId: reg.userId,
        channel: "email",
        title: "Medal Dispatched",
        body: `Your finisher medal for ${reg.event.title} has been dispatched via ${courierFormatted} (AWB: ${item.tracking}).`,
      },
    });

    console.log(`[DISPATCHED] Row ${item.s_no}: ${reg.user.name} (${reg.user.email}) | ${courierFormatted} | ${item.tracking} | Email Sent: ${emailRes.sent}`);
    results.push({ item, user: reg.user.name, email: reg.user.email, emailSent: emailRes.sent });
  }

  console.log(`\nDispatch batch complete. Processed ${results.length} records.`);
  return results;
}

if (process.argv.includes("--run")) {
  dispatchAllMedals()
    .catch(console.error)
    .finally(async () => {
      await prisma.$disconnect();
    });
}
