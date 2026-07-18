import type { Response } from "express";
import type { Prisma } from "@prisma/client";
import type { AuthenticatedRequest } from "../middleware/clerk-auth.js";
import { prisma } from "../lib/prisma.js";
import { writeAdminAudit } from "../services/admin-audit.service.js";
import {
  bulkEmailGeneratedCertificates,
  bulkGenerateQueuedCertificates,
  emailCertificate,
  ensureCertificateForRegistration,
  generateCertificate,
  issueCertificateAfterApproval,
} from "../services/certificate-issue.service.js";
import { ensureDefaultEvents } from "../services/event.service.js";
import { ApiError } from "../utils/api-error.js";
import { routeParam } from "../utils/params.js";
import { validateBody } from "../utils/validate.js";
import {
  adminCertificateUpdateSchema,
  adminCouponSchema,
  adminCouponUpdateSchema,
  adminEventSchema,
  adminEventUpdateSchema,
  adminMarkPaidSchema,
  adminMedalUpdateSchema,
  adminPaymentUpdateSchema,
  adminProofReviewSchema,
  adminRegistrationUpdateSchema,
  adminUserRoleSchema,
} from "../validators/admin.validator.js";

function parsePage(request: AuthenticatedRequest) {
  const page = Math.max(1, Number(request.query.page ?? 1) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(request.query.pageSize ?? 20) || 20));
  return { page, pageSize, skip: (page - 1) * pageSize };
}

function q(request: AuthenticatedRequest, key: string) {
  const value = request.query[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

// ── Me / overview ──────────────────────────────────────────────

export async function adminMe(request: AuthenticatedRequest, response: Response) {
  const clerkId = request.auth?.userId;
  if (!clerkId) {
    // dev bypass
    response.json({
      data: {
        role: "SUPER_ADMIN",
        name: "Dev Admin",
        email: "admin@localhost",
        mode: "dev-bypass",
      },
    });
    return;
  }

  const user = await prisma.user.findFirst({ where: { clerkId } });
  response.json({
    data: {
      id: user?.id,
      role: user?.role ?? "RUNNER",
      name: user?.name,
      email: user?.email,
      clerkId,
      mode: "authenticated",
    },
  });
}

export async function adminOverview(_request: AuthenticatedRequest, response: Response) {
  await ensureDefaultEvents();

  const [
    events,
    openEvents,
    registrations,
    confirmedRegs,
    pendingPayment,
    paidPayments,
    pendingProofs,
    certificates,
    medalsPending,
    users,
    recentRegs,
    recentPayments,
  ] = await Promise.all([
    prisma.event.count(),
    prisma.event.count({ where: { status: "OPEN" } }),
    prisma.registration.count(),
    prisma.registration.count({ where: { status: "CONFIRMED" } }),
    prisma.registration.count({ where: { status: "PENDING_PAYMENT" } }),
    prisma.payment.findMany({ where: { status: "PAID" }, select: { amountInPaise: true } }),
    prisma.registration.count({ where: { proofStatus: "SUBMITTED" } }),
    prisma.certificate.count(),
    prisma.medalDelivery.count({ where: { status: { in: ["PENDING", "DISPATCHED"] } } }),
    prisma.user.count(),
    prisma.registration.findMany({
      take: 8,
      orderBy: { registeredAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        event: { select: { title: true, slug: true } },
        payment: { select: { status: true, amountInPaise: true } },
      },
    }),
    prisma.payment.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        registration: {
          include: {
            user: { select: { name: true, email: true } },
            event: { select: { title: true } },
          },
        },
      },
    }),
  ]);

  const revenueInPaise = paidPayments.reduce((sum, p) => sum + p.amountInPaise, 0);

  response.json({
    data: {
      stats: {
        events,
        openEvents,
        registrations,
        confirmedRegs,
        pendingPayment,
        revenueInPaise,
        revenueInr: Math.round(revenueInPaise / 100),
        pendingProofs,
        certificates,
        medalsPending,
        users,
      },
      recentRegistrations: recentRegs,
      recentPayments,
    },
  });
}

// ── Events ─────────────────────────────────────────────────────

export async function adminListEvents(request: AuthenticatedRequest, response: Response) {
  await ensureDefaultEvents();
  const status = q(request, "status");
  const search = q(request, "q");
  const { page, pageSize, skip } = parsePage(request);

  const where: Prisma.EventWhereInput = {
    ...(status ? { status: status as Prisma.EnumEventStatusFilter["equals"] } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      orderBy: { startsAt: "desc" },
      skip,
      take: pageSize,
      include: {
        _count: { select: { registrations: true } },
      },
    }),
  ]);

  response.json({
    data: items,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
}

export async function adminGetEvent(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const event = await prisma.event.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      _count: { select: { registrations: true } },
      registrations: {
        take: 20,
        orderBy: { registeredAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          payment: true,
        },
      },
    },
  });

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  response.json({ data: event });
}

export async function adminCreateEvent(request: AuthenticatedRequest, response: Response) {
  const payload = validateBody(adminEventSchema, request);
  const paymentRequired =
    payload.paymentRequired ?? (payload.priceInPaise > 0 ? true : false);

  const event = await prisma.event.create({
    data: {
      title: payload.title,
      slug: payload.slug,
      description: payload.description,
      startsAt: payload.startsAt,
      endsAt: payload.endsAt,
      proofClosesAt: payload.proofClosesAt,
      distances: payload.distances,
      priceInPaise: payload.priceInPaise,
      paymentRequired,
      medalIncluded: payload.medalIncluded ?? true,
      featured: payload.featured ?? false,
      maxCapacity: payload.maxCapacity ?? null,
      city: payload.city ?? "Virtual",
      bannerImageUrl: payload.bannerImageUrl || null,
      status: payload.status ?? "DRAFT",
    },
  });

  await writeAdminAudit(request, {
    action: "event.create",
    entityType: "Event",
    entityId: event.id,
    summary: `Created event ${event.title}`,
  });

  response.status(201).json({ data: event });
}

export async function adminUpdateEvent(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const payload = validateBody(adminEventUpdateSchema, request);

  const data: Prisma.EventUpdateInput = {
    ...payload,
    bannerImageUrl:
      payload.bannerImageUrl === "" ? null : payload.bannerImageUrl === undefined
        ? undefined
        : payload.bannerImageUrl,
  };

  if (payload.priceInPaise !== undefined && payload.paymentRequired === undefined) {
    data.paymentRequired = payload.priceInPaise > 0;
  }

  const event = await prisma.event.update({ where: { id }, data });

  await writeAdminAudit(request, {
    action: "event.update",
    entityType: "Event",
    entityId: event.id,
    summary: `Updated event ${event.title}`,
  });

  response.json({ data: event });
}

export async function adminDeleteEvent(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const regs = await prisma.registration.count({ where: { eventId: id } });
  if (regs > 0) {
    throw new ApiError(
      409,
      `Cannot delete event with ${regs} registration(s). Set status to CANCELLED instead.`,
    );
  }

  await prisma.event.delete({ where: { id } });
  await writeAdminAudit(request, {
    action: "event.delete",
    entityType: "Event",
    entityId: id,
    summary: "Deleted event",
  });

  response.status(204).send();
}

// ── Registrations ──────────────────────────────────────────────

export async function adminListRegistrations(request: AuthenticatedRequest, response: Response) {
  const { page, pageSize, skip } = parsePage(request);
  const status = q(request, "status");
  const proofStatus = q(request, "proofStatus");
  const eventId = q(request, "eventId");
  const search = q(request, "q");

  const where: Prisma.RegistrationWhereInput = {
    ...(status ? { status: status as never } : {}),
    ...(proofStatus ? { proofStatus: proofStatus as never } : {}),
    ...(eventId ? { eventId } : {}),
    ...(search
      ? {
          OR: [
            { bibNumber: { contains: search, mode: "insensitive" } },
            { shippingName: { contains: search, mode: "insensitive" } },
            { shippingPhone: { contains: search, mode: "insensitive" } },
            { user: { email: { contains: search, mode: "insensitive" } } },
            { user: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.registration.count({ where }),
    prisma.registration.findMany({
      where,
      orderBy: { registeredAt: "desc" },
      skip,
      take: pageSize,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, clerkId: true } },
        event: { select: { id: true, title: true, slug: true, priceInPaise: true } },
        payment: true,
        proofUpload: true,
        certificate: true,
        medalDelivery: true,
      },
    }),
  ]);

  response.json({
    data: items,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
}

export async function adminGetRegistration(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const registration = await prisma.registration.findUnique({
    where: { id },
    include: {
      user: true,
      event: true,
      payment: true,
      proofUpload: true,
      certificate: true,
      medalDelivery: true,
    },
  });

  if (!registration) {
    throw new ApiError(404, "Registration not found");
  }

  response.json({ data: registration });
}

export async function adminUpdateRegistration(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const payload = validateBody(adminRegistrationUpdateSchema, request);

  const registration = await prisma.registration.update({
    where: { id },
    data: payload,
    include: {
      user: true,
      event: true,
      payment: true,
      proofUpload: true,
      certificate: true,
      medalDelivery: true,
    },
  });

  await writeAdminAudit(request, {
    action: "registration.update",
    entityType: "Registration",
    entityId: id,
    summary: `Updated registration ${registration.bibNumber}`,
  });

  response.json({ data: registration });
}

export async function adminMarkRegistrationPaid(
  request: AuthenticatedRequest,
  response: Response,
) {
  const id = routeParam(request, "id");
  const payload = validateBody(adminMarkPaidSchema, request);

  const existing = await prisma.registration.findUnique({
    where: { id },
    include: { event: true, payment: true },
  });
  if (!existing) {
    throw new ApiError(404, "Registration not found");
  }

  const amount = payload.amountInPaise ?? existing.event.priceInPaise;
  const orderId = existing.payment?.razorpayOrderId ?? `manual_${id}_${Date.now()}`;

  const payment = await prisma.payment.upsert({
    where: { registrationId: id },
    create: {
      registrationId: id,
      razorpayOrderId: orderId,
      razorpayPaymentId: `manual_${Date.now()}`,
      amountInPaise: amount,
      status: "PAID",
      paidAt: new Date(),
    },
    update: {
      status: "PAID",
      paidAt: new Date(),
      amountInPaise: amount,
      razorpayPaymentId: existing.payment?.razorpayPaymentId ?? `manual_${Date.now()}`,
    },
  });

  const registration = await prisma.registration.update({
    where: { id },
    data: {
      status: "CONFIRMED",
      adminNote: payload.note
        ? [existing.adminNote, `Manual paid: ${payload.note}`].filter(Boolean).join("\n")
        : existing.adminNote,
    },
    include: {
      user: true,
      event: true,
      payment: true,
      proofUpload: true,
      certificate: true,
      medalDelivery: true,
    },
  });

  await writeAdminAudit(request, {
    action: "registration.mark_paid",
    entityType: "Registration",
    entityId: id,
    summary: `Marked paid ${amount} paise for ${registration.bibNumber}`,
  });

  response.json({ data: { registration, payment } });
}

export async function adminExportRegistrationsCsv(
  request: AuthenticatedRequest,
  response: Response,
) {
  const eventId = q(request, "eventId");
  const rows = await prisma.registration.findMany({
    where: eventId ? { eventId } : undefined,
    orderBy: { registeredAt: "desc" },
    include: {
      user: true,
      event: true,
      payment: true,
    },
    take: 5000,
  });

  const header = [
    "bibNumber",
    "name",
    "email",
    "phone",
    "event",
    "distance",
    "status",
    "proofStatus",
    "paymentStatus",
    "amountInr",
    "shippingCity",
    "shippingPincode",
    "registeredAt",
  ];

  const escape = (v: string | number | null | undefined) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        r.bibNumber,
        r.user.name,
        r.user.email,
        r.user.phone ?? r.shippingPhone,
        r.event.title,
        r.distance,
        r.status,
        r.proofStatus,
        r.payment?.status ?? "",
        r.payment ? Math.round(r.payment.amountInPaise / 100) : "",
        r.shippingCity,
        r.shippingPincode,
        r.registeredAt.toISOString(),
      ]
        .map(escape)
        .join(","),
    ),
  ];

  response.setHeader("Content-Type", "text/csv; charset=utf-8");
  response.setHeader(
    "Content-Disposition",
    `attachment; filename="registrations-${Date.now()}.csv"`,
  );
  response.send(lines.join("\n"));
}

// ── Payments ───────────────────────────────────────────────────

export async function adminListPayments(request: AuthenticatedRequest, response: Response) {
  const { page, pageSize, skip } = parsePage(request);
  const status = q(request, "status");
  const search = q(request, "q");

  const where: Prisma.PaymentWhereInput = {
    ...(status ? { status: status as never } : {}),
    ...(search
      ? {
          OR: [
            { razorpayOrderId: { contains: search, mode: "insensitive" } },
            { razorpayPaymentId: { contains: search, mode: "insensitive" } },
            {
              registration: {
                user: { email: { contains: search, mode: "insensitive" } },
              },
            },
            {
              registration: {
                bibNumber: { contains: search, mode: "insensitive" },
              },
            },
          ],
        }
      : {}),
  };

  const [total, items, paidAgg] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        registration: {
          include: {
            user: { select: { name: true, email: true } },
            event: { select: { title: true, slug: true } },
          },
        },
      },
    }),
    prisma.payment.aggregate({
      where: { status: "PAID", ...(status === "PAID" || !status ? {} : { id: "none" }) },
      _sum: { amountInPaise: true },
      _count: true,
    }),
  ]);

  const paidOnly = await prisma.payment.aggregate({
    where: { status: "PAID" },
    _sum: { amountInPaise: true },
    _count: true,
  });

  response.json({
    data: items,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      paidCount: paidOnly._count,
      paidRevenueInPaise: paidOnly._sum.amountInPaise ?? 0,
      paidAgg,
    },
  });
}

export async function adminUpdatePayment(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const payload = validateBody(adminPaymentUpdateSchema, request);

  const payment = await prisma.payment.update({
    where: { id },
    data: {
      status: payload.status,
      paidAt: payload.status === "PAID" ? new Date() : undefined,
    },
    include: {
      registration: true,
    },
  });

  if (payload.status === "PAID") {
    await prisma.registration.update({
      where: { id: payment.registrationId },
      data: { status: "CONFIRMED" },
    });
  }

  if (payload.status === "REFUNDED") {
    await prisma.registration.update({
      where: { id: payment.registrationId },
      data: { status: "CANCELLED" },
    });
  }

  await writeAdminAudit(request, {
    action: "payment.update",
    entityType: "Payment",
    entityId: id,
    summary: `Payment status → ${payload.status}`,
  });

  response.json({ data: payment });
}

// ── Users ──────────────────────────────────────────────────────

export async function adminListUsers(request: AuthenticatedRequest, response: Response) {
  const { page, pageSize, skip } = parsePage(request);
  const search = q(request, "q");
  const role = q(request, "role");

  const where: Prisma.UserWhereInput = {
    ...(role ? { role: role as never } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { clerkId: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        _count: { select: { registrations: true } },
      },
    }),
  ]);

  response.json({
    data: items,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
}

export async function adminGetUser(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      registrations: {
        orderBy: { registeredAt: "desc" },
        include: {
          event: true,
          payment: true,
          proofUpload: true,
          certificate: true,
          medalDelivery: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  response.json({ data: user });
}

export async function adminUpdateUserRole(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const payload = validateBody(adminUserRoleSchema, request);

  const user = await prisma.user.update({
    where: { id },
    data: { role: payload.role },
  });

  await writeAdminAudit(request, {
    action: "user.role",
    entityType: "User",
    entityId: id,
    summary: `Role → ${payload.role} for ${user.email}`,
  });

  response.json({ data: user });
}

// ── Proofs ─────────────────────────────────────────────────────

export async function adminListProofs(request: AuthenticatedRequest, response: Response) {
  const { page, pageSize, skip } = parsePage(request);
  const status = q(request, "status") ?? "SUBMITTED";

  const where: Prisma.RegistrationWhereInput = {
    proofStatus: status as never,
    proofUpload: { isNot: null },
  };

  const [total, items] = await Promise.all([
    prisma.registration.count({ where }),
    prisma.registration.findMany({
      where,
      orderBy: { registeredAt: "asc" },
      skip,
      take: pageSize,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        event: { select: { title: true, slug: true, distances: true } },
        proofUpload: true,
        payment: { select: { status: true } },
      },
    }),
  ]);

  response.json({
    data: items,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
}

export async function adminReviewProof(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const payload = validateBody(adminProofReviewSchema, request);
  const status = payload.approved ? "APPROVED" : "REJECTED";

  const existing = await prisma.registration.findUnique({
    where: { id },
    include: { event: true, proofUpload: true },
  });
  if (!existing) {
    throw new ApiError(404, "Registration not found");
  }

  const registration = await prisma.registration.update({
    where: { id },
    data: {
      proofStatus: status,
      finishTimeSeconds: payload.finishTimeSeconds ?? existing.finishTimeSeconds,
      proofUpload: existing.proofUpload
        ? {
            update: {
              status,
              reviewerNote: payload.reviewerNote,
              reviewedAt: new Date(),
            },
          }
        : undefined,
    },
    include: {
      user: true,
      event: true,
      proofUpload: true,
      certificate: true,
      medalDelivery: true,
    },
  });

  let certificateIssue: Awaited<ReturnType<typeof issueCertificateAfterApproval>> | null =
    null;

  if (payload.approved) {
    if (existing.event.medalIncluded) {
      await prisma.medalDelivery.upsert({
        where: { registrationId: id },
        create: { registrationId: id, status: "PENDING" },
        update: {},
      });
    }

    // Scalable path: queue → generate public cert URL → email (if auto-send on)
    try {
      certificateIssue = await issueCertificateAfterApproval(id);
    } catch (err) {
      // Proof still approved even if cert pipeline hiccups; admin can retry.
      console.error("[admin] certificate issue after approve failed:", err);
      await ensureCertificateForRegistration(id);
    }
  }

  await writeAdminAudit(request, {
    action: payload.approved ? "proof.approve" : "proof.reject",
    entityType: "Registration",
    entityId: id,
    summary: `${status} proof for ${registration.bibNumber}`,
  });

  const refreshed = await prisma.registration.findUnique({
    where: { id },
    include: {
      user: true,
      event: true,
      proofUpload: true,
      certificate: true,
      medalDelivery: true,
    },
  });

  response.json({
    data: refreshed ?? registration,
    meta: {
      certificate: certificateIssue
        ? {
            id: certificateIssue.certificate.id,
            status: certificateIssue.certificate.status,
            certificateNumber: certificateIssue.certificate.certificateNumber,
            pdfUrl: certificateIssue.certificate.pdfUrl,
            emailSent: certificateIssue.email.sent,
            emailError: certificateIssue.email.error ?? null,
          }
        : null,
    },
  });
}

// ── Medals ─────────────────────────────────────────────────────

export async function adminListMedals(request: AuthenticatedRequest, response: Response) {
  const { page, pageSize, skip } = parsePage(request);
  const status = q(request, "status");

  const where: Prisma.MedalDeliveryWhereInput = {
    ...(status ? { status: status as never } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.medalDelivery.count({ where }),
    prisma.medalDelivery.findMany({
      where,
      orderBy: { id: "desc" },
      skip,
      take: pageSize,
      include: {
        registration: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
            event: { select: { title: true } },
          },
        },
      },
    }),
  ]);

  response.json({
    data: items,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
}

export async function adminUpdateMedal(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const payload = validateBody(adminMedalUpdateSchema, request);

  const medal = await prisma.medalDelivery.update({
    where: { id },
    data: {
      status: payload.status,
      courier: payload.courier === undefined ? undefined : payload.courier,
      trackingNumber:
        payload.trackingNumber === undefined ? undefined : payload.trackingNumber,
      trackingUrl:
        payload.trackingUrl === "" || payload.trackingUrl === undefined
          ? payload.trackingUrl === ""
            ? null
            : undefined
          : payload.trackingUrl,
      dispatchedAt: payload.status === "DISPATCHED" ? new Date() : undefined,
      deliveredAt: payload.status === "DELIVERED" ? new Date() : undefined,
    },
    include: {
      registration: {
        include: { user: true, event: true },
      },
    },
  });

  await writeAdminAudit(request, {
    action: "medal.update",
    entityType: "MedalDelivery",
    entityId: id,
    summary: `Medal → ${payload.status}`,
  });

  response.json({ data: medal });
}

// ── Certificates ───────────────────────────────────────────────

export async function adminListCertificates(request: AuthenticatedRequest, response: Response) {
  const { page, pageSize, skip } = parsePage(request);
  const status = q(request, "status");

  const where: Prisma.CertificateWhereInput = {
    ...(status ? { status: status as never } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.certificate.count({ where }),
    prisma.certificate.findMany({
      where,
      orderBy: { id: "desc" },
      skip,
      take: pageSize,
      include: {
        registration: {
          include: {
            user: { select: { name: true, email: true } },
            event: { select: { title: true } },
          },
        },
      },
    }),
  ]);

  response.json({
    data: items,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
}

export async function adminUpdateCertificate(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const payload = validateBody(adminCertificateUpdateSchema, request);

  const certificate = await prisma.certificate.update({
    where: { id },
    data: {
      status: payload.status,
      pdfUrl:
        payload.pdfUrl === "" ? null : payload.pdfUrl === undefined ? undefined : payload.pdfUrl,
      issuedAt:
        payload.status === "GENERATED" || payload.status === "SENT" ? new Date() : undefined,
    },
    include: {
      registration: {
        include: { user: true, event: true },
      },
    },
  });

  await writeAdminAudit(request, {
    action: "certificate.update",
    entityType: "Certificate",
    entityId: id,
    summary: `Certificate → ${payload.status}`,
  });

  response.json({ data: certificate });
}

export async function adminGenerateCertificate(
  request: AuthenticatedRequest,
  response: Response,
) {
  const id = routeParam(request, "id");
  const certificate = await generateCertificate(id);

  await writeAdminAudit(request, {
    action: "certificate.generate",
    entityType: "Certificate",
    entityId: id,
    summary: `Generated ${certificate.certificateNumber}`,
  });

  response.json({ data: certificate });
}

export async function adminSendCertificate(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const result = await emailCertificate(id);

  await writeAdminAudit(request, {
    action: "certificate.send",
    entityType: "Certificate",
    entityId: id,
    summary: result.email.sent
      ? `Emailed ${result.certificate.certificateNumber}`
      : `Email failed for ${result.certificate.certificateNumber}: ${result.email.error ?? "unknown"}`,
  });

  response.json({
    data: result.certificate,
    meta: { email: result.email },
  });
}

export async function adminGenerateAndSendCertificate(
  request: AuthenticatedRequest,
  response: Response,
) {
  const id = routeParam(request, "id");
  await generateCertificate(id);
  const result = await emailCertificate(id);

  await writeAdminAudit(request, {
    action: "certificate.generate_send",
    entityType: "Certificate",
    entityId: id,
    summary: `Generate+send ${result.certificate.certificateNumber} (email: ${result.email.sent ? "ok" : "fail"})`,
  });

  response.json({
    data: result.certificate,
    meta: { email: result.email },
  });
}

export async function adminBulkGenerateCertificates(
  request: AuthenticatedRequest,
  response: Response,
) {
  const limitRaw = typeof request.query.limit === "string" ? Number(request.query.limit) : 50;
  const items = await bulkGenerateQueuedCertificates(Number.isFinite(limitRaw) ? limitRaw : 50);

  await writeAdminAudit(request, {
    action: "certificate.bulk_generate",
    entityType: "Certificate",
    entityId: "bulk",
    summary: `Bulk generated ${items.length} certificates`,
  });

  response.json({ data: items, meta: { count: items.length } });
}

export async function adminBulkSendCertificates(
  request: AuthenticatedRequest,
  response: Response,
) {
  const limitRaw = typeof request.query.limit === "string" ? Number(request.query.limit) : 50;
  const items = await bulkEmailGeneratedCertificates(Number.isFinite(limitRaw) ? limitRaw : 50);
  const sent = items.filter((i) => i.email.sent).length;

  await writeAdminAudit(request, {
    action: "certificate.bulk_send",
    entityType: "Certificate",
    entityId: "bulk",
    summary: `Bulk emailed ${sent}/${items.length} certificates`,
  });

  response.json({
    data: items.map((i) => ({
      certificate: i.certificate,
      email: i.email,
    })),
    meta: { count: items.length, sent },
  });
}

/** Create a certificate row for an approved registration that is missing one. */
export async function adminEnsureCertificateForRegistration(
  request: AuthenticatedRequest,
  response: Response,
) {
  const registrationId = routeParam(request, "id");
  const registration = await prisma.registration.findUnique({ where: { id: registrationId } });
  if (!registration) {
    throw new ApiError(404, "Registration not found");
  }
  if (registration.proofStatus !== "APPROVED") {
    throw new ApiError(422, "Certificate can only be created for approved proofs");
  }

  const cert = await ensureCertificateForRegistration(registrationId);
  const generated = await generateCertificate(cert.id);

  await writeAdminAudit(request, {
    action: "certificate.ensure",
    entityType: "Certificate",
    entityId: generated.id,
    summary: `Ensured certificate for registration ${registration.bibNumber}`,
  });

  response.json({ data: generated });
}

// ── Coupons ────────────────────────────────────────────────────

export async function adminListCoupons(_request: AuthenticatedRequest, response: Response) {
  const items = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  response.json({ data: items });
}

export async function adminCreateCoupon(request: AuthenticatedRequest, response: Response) {
  const payload = validateBody(adminCouponSchema, request);
  const coupon = await prisma.coupon.create({
    data: {
      code: payload.code,
      discountPaise: payload.discountPaise,
      maxRedemptions: payload.maxRedemptions ?? null,
      expiresAt: payload.expiresAt ?? null,
      active: payload.active ?? true,
    },
  });

  await writeAdminAudit(request, {
    action: "coupon.create",
    entityType: "Coupon",
    entityId: coupon.id,
    summary: `Created coupon ${coupon.code}`,
  });

  response.status(201).json({ data: coupon });
}

export async function adminUpdateCoupon(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  const payload = validateBody(adminCouponUpdateSchema, request);
  const coupon = await prisma.coupon.update({
    where: { id },
    data: payload,
  });

  await writeAdminAudit(request, {
    action: "coupon.update",
    entityType: "Coupon",
    entityId: id,
    summary: `Updated coupon ${coupon.code}`,
  });

  response.json({ data: coupon });
}

export async function adminDeleteCoupon(request: AuthenticatedRequest, response: Response) {
  const id = routeParam(request, "id");
  await prisma.coupon.delete({ where: { id } });
  await writeAdminAudit(request, {
    action: "coupon.delete",
    entityType: "Coupon",
    entityId: id,
    summary: "Deleted coupon",
  });
  response.status(204).send();
}

// ── Audit ──────────────────────────────────────────────────────

export async function adminListAudit(request: AuthenticatedRequest, response: Response) {
  const { page, pageSize, skip } = parsePage(request);
  const [total, items] = await Promise.all([
    prisma.adminAuditLog.count(),
    prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
  ]);

  response.json({
    data: items,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
}
