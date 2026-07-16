import type { AuthenticatedRequest } from "../middleware/clerk-auth.js";
import { prisma } from "../lib/prisma.js";

export async function writeAdminAudit(
  request: AuthenticatedRequest,
  input: {
    action: string;
    entityType: string;
    entityId?: string | null;
    summary?: string;
    actorEmail?: string | null;
  },
) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        actorClerkId: request.auth?.userId ?? null,
        actorEmail: input.actorEmail ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        summary: input.summary ?? null,
      },
    });
  } catch {
    // never fail the main request because audit write failed
  }
}
