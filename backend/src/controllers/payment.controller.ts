import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { sendRegistrationConfirmationEmail } from "../services/email.service.js";
import {
  createRazorpayOrder,
  verifyCheckoutSignature,
  verifyWebhookSignature,
} from "../services/razorpay.service.js";
import { ApiError } from "../utils/api-error.js";
import { validateBody } from "../utils/validate.js";
import { createPaymentOrderSchema, verifyPaymentSchema } from "../validators/payment.validator.js";

export async function createPaymentOrder(request: Request, response: Response) {
  const payload = validateBody(createPaymentOrderSchema, request);
  const registration = await prisma.registration.findUnique({
    where: { id: payload.registrationId },
    include: { event: true, payment: true, user: true },
  });

  if (!registration) {
    throw new ApiError(404, "Registration not found");
  }

  if (registration.payment?.status === "PAID") {
    throw new ApiError(409, "Registration is already paid");
  }

  const order = await createRazorpayOrder({
    amountInPaise: registration.event.priceInPaise,
    receipt: registration.bibNumber,
    registrationId: registration.id,
  });

  const payment = await prisma.payment.upsert({
    where: { registrationId: registration.id },
    create: {
      registrationId: registration.id,
      razorpayOrderId: order.id,
      amountInPaise: order.amount,
      status: "CREATED",
    },
    update: {
      razorpayOrderId: order.id,
      amountInPaise: order.amount,
      status: "CREATED",
      razorpayPaymentId: null,
      razorpaySignature: null,
      paidAt: null,
    },
  });

  response.status(201).json({
    data: {
      keyId: env.razorpayKeyId,
      orderId: order.id,
      amountInPaise: order.amount,
      currency: order.currency,
      registrationId: registration.id,
      bibNumber: registration.bibNumber,
      runner: {
        name: registration.user.name,
        email: registration.user.email,
        phone: registration.user.phone,
      },
      payment,
    },
  });
}

export async function verifyPayment(request: Request, response: Response) {
  const payload = validateBody(verifyPaymentSchema, request);
  const isValid = verifyCheckoutSignature({
    razorpayOrderId: payload.razorpay_order_id,
    razorpayPaymentId: payload.razorpay_payment_id,
    razorpaySignature: payload.razorpay_signature,
  });

  if (!isValid) {
    throw new ApiError(400, "Invalid Razorpay payment signature");
  }

  const payment = await prisma.payment.update({
    where: { razorpayOrderId: payload.razorpay_order_id },
    data: {
      razorpayPaymentId: payload.razorpay_payment_id,
      razorpaySignature: payload.razorpay_signature,
      status: "PAID",
      paidAt: new Date(),
      registration: {
        update: { status: "CONFIRMED" },
      },
    },
    include: {
      registration: {
        include: {
          user: true,
          event: true,
        },
      },
    },
  });

  const emailResult = await sendRegistrationConfirmationEmail({
    to: payment.registration.user.email,
    runnerName: payment.registration.user.name,
    eventTitle: payment.registration.event.title,
    distance: payment.registration.distance,
    bibNumber: payment.registration.bibNumber,
    amountInPaise: payment.amountInPaise,
  });

  await prisma.notification.create({
    data: {
      userId: payment.registration.userId,
      channel: "email",
      title: emailResult.sent
        ? "Registration confirmation email sent"
        : "Registration confirmation email failed",
      body: emailResult.sent
        ? `Confirmation sent to ${payment.registration.user.email}`
        : emailResult.error ?? "Email was not sent",
    },
  });

  response.json({
    data: {
      ...payment,
      emailSent: emailResult.sent,
      emailId: emailResult.id,
      emailError: emailResult.error,
    },
  });
}

export async function handleRazorpayWebhook(request: Request, response: Response) {
  const rawBody = Buffer.isBuffer(request.body) ? request.body : Buffer.from(JSON.stringify(request.body));
  const isValid = verifyWebhookSignature(rawBody, request.header("x-razorpay-signature"));

  if (!isValid) {
    throw new ApiError(400, "Invalid Razorpay webhook signature");
  }

  const event = JSON.parse(rawBody.toString("utf8")) as {
    event?: string;
    payload?: {
      payment?: { entity?: { id?: string; order_id?: string; status?: string } };
      order?: { entity?: { id?: string; status?: string } };
    };
  };

  const orderId = event.payload?.payment?.entity?.order_id ?? event.payload?.order?.entity?.id;
  const paymentId = event.payload?.payment?.entity?.id;

  if (orderId && (event.event === "payment.captured" || event.event === "order.paid")) {
    const payment = await prisma.payment.update({
      where: { razorpayOrderId: orderId },
      data: {
        status: "PAID",
        razorpayPaymentId: paymentId,
        paidAt: new Date(),
        registration: {
          update: { status: "CONFIRMED" },
        },
      },
      include: {
        registration: {
          include: {
            user: true,
            event: true,
          },
        },
      },
    });

    await sendRegistrationConfirmationEmail({
      to: payment.registration.user.email,
      runnerName: payment.registration.user.name,
      eventTitle: payment.registration.event.title,
      distance: payment.registration.distance,
      bibNumber: payment.registration.bibNumber,
      amountInPaise: payment.amountInPaise,
    });
  }

  response.json({ received: true });
}
