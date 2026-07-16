import { z } from "zod";

const eventStatusEnum = z.enum(["DRAFT", "OPEN", "CLOSED", "COMPLETED", "CANCELLED"]);

export const createEventSchema = z.object({
  title: z.string().min(3),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Slug can use lowercase letters, numbers, and hyphens only"),
  description: z.string().min(20),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  proofClosesAt: z.coerce.date(),
  distances: z.array(z.string().min(1)).min(1),
  priceInPaise: z.number().int().positive(),
  medalIncluded: z.boolean().optional(),
  city: z.string().optional(),
  bannerImageUrl: z.string().url().optional(),
  status: eventStatusEnum.optional(),
});

export const updateEventSchema = createEventSchema.partial().extend({
  status: eventStatusEnum.optional(),
});
