import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { sendTelegramAlert } from "../services/alert.service.js";
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
    void sendTelegramAlert({
      title: "Invalid Payment Signature",
      level: "CRITICAL",
      service: "Razorpay Checkout",
      message: "Payment verification failed due to signature mismatch.",
      details: {
        orderId: payload.razorpay_order_id,
        paymentId: payload.razorpay_payment_id,
      },
      link: `${env.frontendUrl}/admin`,
    });
    throw new ApiError(400, "Invalid Razorpay payment signature");
  }

  const payment = await prisma.payment.update({
    where: { razorpayOrderId: payload.razorpay_order_id },
    data: {
      razorpayPaymentId: payload.razorpay_payment_id,
      razorpaySignature: payload.razorpay_signature,
      status: "PAID",
      paidAt: new Date(),
    },
  });

  let emailSent = false;
  let emailId: string | undefined;
  let emailError: string | undefined;

  try {
    const registration = await prisma.registration.update({
      where: { id: payment.registrationId },
      data: { status: "CONFIRMED" },
      include: { user: true, event: true },
    });

    const emailResult = await sendRegistrationConfirmationEmail({
      to: registration.user.email,
      runnerName: registration.user.name,
      eventTitle: registration.event.title,
      distance: registration.distance,
      bibNumber: registration.bibNumber,
      amountInPaise: payment.amountInPaise,
    });

    emailSent = emailResult.sent;
    emailId = emailResult.id;
    emailError = emailResult.error;

    await prisma.notification.create({
      data: {
        userId: registration.userId,
        channel: "email",
        title: emailResult.sent
          ? "Registration confirmation email sent"
          : "Registration confirmation email failed",
        body: emailResult.sent
          ? `Confirmation sent to ${registration.user.email}`
          : emailResult.error ?? "Email was not sent",
      },
    });
  } catch (err) {
    console.error("[verifyPayment] Registration update or email failed:", err);
    void sendTelegramAlert({
      title: "Post-Payment Registration Update Failed",
      level: "CRITICAL",
      service: "Payment Controller",
      message: "Payment was marked PAID but updating registration failed.",
      details: {
        orderId: payload.razorpay_order_id,
        paymentId: payload.razorpay_payment_id,
        registrationId: payment.registrationId,
      },
      error: err,
      link: `${env.frontendUrl}/admin/registrations/${payment.registrationId}`,
    });
  }

  response.json({
    data: {
      ...payment,
      emailSent,
      emailId,
      emailError,
    },
  });
}

export async function handleRazorpayWebhook(request: Request, response: Response) {
  const rawBody = Buffer.isBuffer(request.body) ? request.body : Buffer.from(JSON.stringify(request.body));
  const isValid = verifyWebhookSignature(rawBody, request.header("x-razorpay-signature"));

  if (!isValid) {
    void sendTelegramAlert({
      title: "Invalid Razorpay Webhook Signature",
      level: "WARNING",
      service: "Razorpay Webhook",
      message: "Webhook request rejected due to invalid signature.",
      details: {
        ip: request.ip,
      },
    });
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
    const existingPayment = await prisma.payment.findUnique({
      where: { razorpayOrderId: orderId },
      select: { status: true },
    });
    if (existingPayment?.status === "PAID") {
      return response.json({ received: true });
    }
    const payment = await prisma.payment.update({
      where: { razorpayOrderId: orderId },
      data: {
        status: "PAID",
        razorpayPaymentId: paymentId,
        paidAt: new Date(),
      },
    });

    try {
      const registration = await prisma.registration.update({
        where: { id: payment.registrationId },
        data: { status: "CONFIRMED" },
        include: { user: true, event: true },
      });

      await sendRegistrationConfirmationEmail({
        to: registration.user.email,
        runnerName: registration.user.name,
        eventTitle: registration.event.title,
        distance: registration.distance,
        bibNumber: registration.bibNumber,
        amountInPaise: payment.amountInPaise,
      });
    } catch (err) {
      console.error("[webhook] Failed to update registration or send email:", err);
      void sendTelegramAlert({
        title: "Webhook Registration Confirmation Failed",
        level: "CRITICAL",
        service: "Razorpay Webhook",
        message: "Payment captured in webhook but registration update failed.",
        details: {
          orderId,
          paymentId,
          registrationId: payment.registrationId,
        },
        error: err,
        link: `${env.frontendUrl}/admin/registrations/${payment.registrationId}`,
      });
    }
  }

  response.json({ received: true });
}
