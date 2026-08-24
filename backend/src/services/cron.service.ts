import cron from "node-cron";
import { prisma } from "../lib/prisma.js";
import { sendTelegramAlert } from "./alert.service.js";

function getStartOfTodayIST(): Date {
  const now = new Date();
  const offsetIST = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(now.getTime() + offsetIST);
  nowIST.setUTCHours(0, 0, 0, 0);
  return new Date(nowIST.getTime() - offsetIST);
}

export async function sendDailyDigest() {
  console.log("[Cron] Sending daily digest to Telegram...");
  try {
    const today = getStartOfTodayIST();

    // 1. Revenue Today
    const paymentsToday = await prisma.payment.aggregate({
      where: {
        status: "PAID",
        paidAt: { gte: today },
      },
      _sum: { amountInPaise: true },
      _count: { id: true },
    });
    const revenueInr = (paymentsToday._sum.amountInPaise || 0) / 100;
    const paidOrders = paymentsToday._count.id;

    // 2. New Registrations Today
    const newRunners = await prisma.registration.count({
      where: {
        registeredAt: { gte: today },
      },
    });

    // 3. Proofs Pending Review
    const pendingProofs = await prisma.proofUpload.count({
      where: { status: "SUBMITTED" },
    });

    // 4. Total Users
    const totalUsers = await prisma.user.count();

    // Send Digest
    const timestamp = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
    });

    const lines = [
      `📊 <b>Mountain Run Daily Report (${timestamp}):</b>`,
      `💰 <b>Revenue:</b> ₹${revenueInr.toLocaleString("en-IN")} (${paidOrders} paid orders)`,
      `🏃 <b>New Runners:</b> ${newRunners}`,
      `📸 <b>Proofs in Queue:</b> ${pendingProofs}`,
      `👥 <b>Total Database:</b> ${totalUsers} users`,
    ];

    await sendTelegramAlert({
      title: "Daily Digest",
      level: "INFO",
      service: "cron",
      message: lines.join("\n"),
    });

    console.log("[Cron] Daily digest sent successfully!");
  } catch (error) {
    console.error("[Cron] Failed to send daily digest:", error);
    await sendTelegramAlert({
      title: "Daily Digest Failed",
      level: "ERROR",
      service: "cron",
      message: "Failed to generate daily digest.",
      error,
    });
  }
}

export function initCronJobs() {
  // Run daily at 11:59 PM (23:59) server time
  // If server is UTC, we should adjust. Assuming server is UTC, 11:59 PM IST is 18:29 UTC.
  // We can just use the timezone option in node-cron!
  cron.schedule("59 23 * * *", () => {
    void sendDailyDigest();
  }, {
    timezone: "Asia/Kolkata"
  });

  console.log("[Cron] Initialized all scheduled jobs.");
}
