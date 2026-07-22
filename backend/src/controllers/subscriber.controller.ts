import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import { validateBody } from "../utils/validate.js";

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const unsubscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function subscribe(request: Request, response: Response) {
  const { email } = validateBody(subscribeSchema, request);

  const existing = await prisma.subscriber.findUnique({ where: { email } });
  if (existing) {
    if (!existing.subscribed) {
      await prisma.subscriber.update({ where: { id: existing.id }, data: { subscribed: true } });
    }
    response.json({ data: { message: "You're already subscribed!" } });
    return;
  }

  await prisma.subscriber.create({ data: { email } });

  response.status(201).json({
    data: { message: "You're subscribed! Stay tuned for updates." },
  });
}

export async function unsubscribe(request: Request, response: Response) {
  const { email } = validateBody(unsubscribeSchema, request);

  const existing = await prisma.subscriber.findUnique({ where: { email } });
  if (!existing) {
    response.json({ data: { message: "You're not in our list. Nothing to do." } });
    return;
  }

  if (!existing.subscribed) {
    response.json({ data: { message: "You were already unsubscribed." } });
    return;
  }

  await prisma.subscriber.update({
    where: { id: existing.id },
    data: { subscribed: false },
  });

  response.json({ data: { message: "You've been unsubscribed. We're sorry to see you go." } });
}
