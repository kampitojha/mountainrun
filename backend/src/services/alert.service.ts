import { env } from "../config/env.js";

export type AlertLevel = "CRITICAL" | "ERROR" | "WARNING" | "INFO";

export type AlertOptions = {
  title: string;
  level?: AlertLevel;
  service?: string;
  message: string;
  details?: Record<string, string | number | boolean | null | undefined>;
  error?: unknown;
  link?: string;
};

// Simple in-memory deduplication cache (prevents alert storms)
const recentAlerts = new Map<string, { lastSent: number; count: number }>();
const DEDUP_WINDOW_MS = 60 * 1000; // 1 minute window

function getLevelEmoji(level: AlertLevel): string {
  switch (level) {
    case "CRITICAL":
      return "🚨 <b>[CRITICAL ALERT]</b>";
    case "ERROR":
      return "❌ <b>[ERROR ALERT]</b>";
    case "WARNING":
      return "⚠️ <b>[WARNING]</b>";
    case "INFO":
      return "ℹ️ <b>[INFO]</b>";
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function sendTelegramAlert(options: AlertOptions): Promise<boolean> {
  const token = env.telegramBotToken;
  const chatId = env.telegramChatId;

  if (!token || !chatId) {
    // Alerts disabled or not configured
    return false;
  }

  const level = options.level ?? "ERROR";
  const dedupKey = `${options.service ?? "app"}:${options.title}:${options.message}`;
  const now = Date.now();
  const existing = recentAlerts.get(dedupKey);

  if (existing && now - existing.lastSent < DEDUP_WINDOW_MS) {
    existing.count += 1;
    // Suppress rapid spam of identical error
    return false;
  }

  recentAlerts.set(dedupKey, { lastSent: now, count: 1 });

  // Clean old deduplication entries
  if (recentAlerts.size > 200) {
    for (const [k, v] of recentAlerts.entries()) {
      if (now - v.lastSent > DEDUP_WINDOW_MS) {
        recentAlerts.delete(k);
      }
    }
  }

  const timestamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const lines: string[] = [
    `${getLevelEmoji(level)} <b>Mountain Run</b>`,
    `<b>Title:</b> ${escapeHtml(options.title)}`,
  ];

  if (options.service) {
    lines.push(`<b>Service:</b> <code>${escapeHtml(options.service)}</code>`);
  }

  lines.push(`<b>Message:</b> ${escapeHtml(options.message)}`);

  if (options.details && Object.keys(options.details).length > 0) {
    lines.push(`\n<b>📋 Details:</b>`);
    for (const [k, v] of Object.entries(options.details)) {
      if (v !== undefined && v !== null && v !== "") {
        lines.push(`• <b>${escapeHtml(k)}:</b> <code>${escapeHtml(String(v))}</code>`);
      }
    }
  }

  if (options.error) {
    let errorText = "";
    if (options.error instanceof Error) {
      errorText = options.error.stack || options.error.message;
    } else if (typeof options.error === "object") {
      errorText = JSON.stringify(options.error, null, 2);
    } else {
      errorText = String(options.error);
    }

    // Limit stack trace length to avoid hitting Telegram message limit (4096 chars)
    if (errorText.length > 500) {
      errorText = errorText.substring(0, 500) + "...";
    }

    lines.push(`\n<b>⚠️ Trace / Error:</b>\n<pre>${escapeHtml(errorText)}</pre>`);
  }

  lines.push(`\n🕒 <i>${timestamp} IST</i>`);

  if (options.link) {
    lines.push(`🔗 <a href="${options.link}">Open in Dashboard</a>`);
  }

  const text = lines.join("\n");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      console.error("[TelegramAlert] Failed to send alert:", errJson);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[TelegramAlert] Error sending notification:", err);
    return false;
  }
}
