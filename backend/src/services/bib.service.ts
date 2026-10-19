import { prisma } from "../lib/prisma.js";

export function createBibNumber(eventSlug: string) {
  const eventCode = eventSlug
    .split("-")
    .map((part) => part[0])
    .join("")
    .slice(0, 4)
    .toUpperCase()
    .padEnd(3, "R");
  const random = Math.floor(100000 + Math.random() * 900000);

  return `${eventCode}-${random}`;
}

/**
 * Generates a unique bib number for an event.
 * If preferredBib is provided and available, it is safely used.
 * Otherwise, generates candidate bibs and checks Prisma to guarantee uniqueness.
 */
export async function generateUniqueBibNumber(
  eventSlug: string,
  preferredBib?: string,
): Promise<string> {
  // If a valid preferred bib was passed (e.g. from live preview), verify it's free
  if (preferredBib && preferredBib.trim().length >= 3) {
    const cleanBib = preferredBib.trim().toUpperCase();
    const existing = await prisma.registration.findUnique({
      where: { bibNumber: cleanBib },
      select: { id: true },
    });
    if (!existing) {
      return cleanBib;
    }
  }

  // Generate candidate bibs with DB uniqueness check (up to 25 attempts)
  for (let attempt = 0; attempt < 25; attempt++) {
    const candidate = createBibNumber(eventSlug);
    const existing = await prisma.registration.findUnique({
      where: { bibNumber: candidate },
      select: { id: true },
    });
    if (!existing) {
      return candidate;
    }
  }

  // High-concurrency fallback: eventCode + last 6 digits of timestamp + 2 random digits
  const eventCode = eventSlug
    .split("-")
    .map((part) => part[0])
    .join("")
    .slice(0, 4)
    .toUpperCase()
    .padEnd(3, "R");
  const timeSuffix = `${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;
  return `${eventCode}-${timeSuffix}`;
}
