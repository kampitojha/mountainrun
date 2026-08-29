import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { sendMedalDispatchEmail, type MedalDispatchEmailPayload } from "../services/email.service.js";

const __dirname_esm = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname_esm, "../../.env") });

const prisma = new PrismaClient();

async function main() {
  // Test DTDC format
  const dtdcPayload: MedalDispatchEmailPayload = {
    to: "itskampitojha@gmail.com",
    runnerName: "Subhash shewale",
    eventTitle: "Independence Day Virtual Run 2026 🇮🇳",
    bibNumber: "IDVR-478727",
    distance: "10 km",
    courier: "DTDC Courier",
    trackingNumber: "7D136263697",
    trackingUrl: "https://www.dtdc.com/track-your-shipment/",
    shippingLine1: "Ojhar Nashik Maharashtra hal township type 2 B 1420",
    shippingCity: "Nashik",
    shippingState: "Maharashtra",
    shippingPincode: "422207",
  };

  console.log("Sending sample DTDC test email to itskampitojha@gmail.com...");
  const result = await sendMedalDispatchEmail(dtdcPayload);
  console.log("DTDC test email result:", result);
}

main()
  .catch((err) => {
    console.error("Error:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
