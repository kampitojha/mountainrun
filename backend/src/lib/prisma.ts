import { PrismaClient } from "@prisma/client";

function getPrismaDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;

  let url = raw.trim();
  // When using Neon's connection pooler, configure pgbouncer and cold-start timeout
  if (url.includes("-pooler.") && !url.includes("pgbouncer=")) {
    url += (url.includes("?") ? "&" : "?") + "pgbouncer=true";
  }
  if (!url.includes("connect_timeout=")) {
    url += (url.includes("?") ? "&" : "?") + "connect_timeout=30";
  }
  return url;
}

const dbUrl = getPrismaDatabaseUrl();

export const prisma = new PrismaClient({
  ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});
