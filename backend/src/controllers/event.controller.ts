import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import {
  ensureDefaultEvents,
  getEventPhase,
  scopeWhere,
  withEventMeta,
} from "../services/event.service.js";
import { ApiError } from "../utils/api-error.js";
import { routeParam } from "../utils/params.js";
import { validateBody } from "../utils/validate.js";
import { createEventSchema, updateEventSchema } from "../validators/event.validator.js";

const eventInclude = {
  _count: {
    select: {
      registrations: true,
    },
  },
} as const;

export async function listEvents(request: Request, response: Response) {
  await ensureDefaultEvents();

  const scope = typeof request.query.scope === "string" ? request.query.scope : "all";
  const group = request.query.group === "1" || request.query.group === "true";

  const events = await prisma.event.findMany({
    where: scopeWhere(scope),
    orderBy: [{ startsAt: "desc" }],
    include: eventInclude,
  });

  const enriched = events.map((event) => withEventMeta(event));

  if (group) {
    const upcoming = enriched
      .filter((event) => event.phase === "upcoming" || event.phase === "live")
      .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
    const past = enriched
      .filter((event) => event.phase === "past")
      .sort((a, b) => b.endsAt.getTime() - a.endsAt.getTime());

    response.json({
      data: { upcoming, past },
      meta: {
        upcomingCount: upcoming.length,
        pastCount: past.length,
        total: enriched.length,
      },
    });
    return;
  }

  // For open/upcoming lists, show soonest first
  if (scope === "upcoming" || scope === "open" || scope === "live") {
    enriched.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  }

  response.json({
    data: enriched,
    meta: {
      scope,
      total: enriched.length,
      upcomingCount: enriched.filter((e) => e.phase === "upcoming" || e.phase === "live").length,
      pastCount: enriched.filter((e) => e.phase === "past").length,
    },
  });
}

export async function getEvent(request: Request, response: Response) {
  await ensureDefaultEvents();

  const key = routeParam(request, "slug");
  const event = await prisma.event.findFirst({
    where: {
      OR: [{ slug: key }, { id: key }],
    },
    include: eventInclude,
  });

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  const phase = getEventPhase(event);
  const verifiedResults = await prisma.registration.count({
    where: {
      eventId: event.id,
      proofStatus: "APPROVED",
    },
  });

  response.json({
    data: {
      ...withEventMeta(event),
      stats: {
        registrations: event._count.registrations,
        verifiedResults,
        finishers: verifiedResults,
      },
    },
  });
}

export async function createEvent(request: Request, response: Response) {
  const payload = validateBody(createEventSchema, request);

  // Auto-generate slug from title if not provided
  const slug = payload.slug?.trim() ||
    payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

  // Default description
  const description = payload.description?.trim() ||
    `${payload.title} virtual running event.`;

  // Default proofClosesAt to endsAt if not provided
  const proofClosesAt = payload.proofClosesAt ?? payload.endsAt;

  const event = await prisma.event.create({
    data: {
      ...payload,
      slug,
      description,
      proofClosesAt,
      medalIncluded: payload.medalIncluded ?? true,
      status: payload.status ?? "OPEN",
    },
  });

  response.status(201).json({ data: withEventMeta(event) });
}

export async function updateEvent(request: Request, response: Response) {
  const payload = validateBody(updateEventSchema, request);

  // Auto-generate slug from title if slug is being cleared/not provided but title is changing
  const updateData: typeof payload = { ...payload };
  if (payload.title && !payload.slug) {
    updateData.slug = payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  }

  const event = await prisma.event.update({
    where: { id: routeParam(request, "id") },
    data: updateData,
  });

  response.json({ data: withEventMeta(event) });
}

export async function deleteEvent(request: Request, response: Response) {
  await prisma.event.delete({
    where: { id: routeParam(request, "id") },
  });

  response.status(204).send();
}
