import { z } from "zod";
import { isIndianState } from "../data/indian-states.js";

const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/\s+/g, ""))
  .refine((value) => /^\+\d{8,15}$/.test(value), {
    message: "Enter a valid mobile number with country code",
  });

const indianStateSchema = z
  .string()
  .trim()
  .refine((value) => isIndianState(value), {
    message: "Choose a valid Indian state",
  });

const pincodeSchema = z
  .string()
  .trim()
  .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit pincode");

export const createRegistrationSchema = z
  .object({
    userId: z.string().min(1).optional(),
    clerkId: z.string().min(1).optional(),
    name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores")
      .optional(),
    email: z.string().trim().email("Enter a valid email").optional(),
    phone: phoneSchema.optional(),
    eventId: z.string().min(1).optional(),
    eventSlug: z.string().min(1).optional(),
    distance: z.string().min(1, "Distance is required"),
    shippingName: z.string().trim().min(2, "Shipping name is required"),
    shippingPhone: phoneSchema,
    shippingLine1: z.string().trim().min(5, "Address must be at least 5 characters"),
    shippingLine2: z.string().trim().max(120, "Landmark must be 120 characters or fewer").optional(),
    shippingCity: z.string().trim().min(2, "City is required"),
    shippingState: indianStateSchema,
    shippingPincode: pincodeSchema,
  })
  .superRefine((value, context) => {
    if (!value.userId && !value.clerkId && (!value.name || !value.email)) {
      context.addIssue({
        code: "custom",
        message: "Either clerkId/userId or runner name and email are required",
        path: ["email"],
      });
    }

    if (!value.eventId && !value.eventSlug) {
      context.addIssue({
        code: "custom",
        message: "Either eventId or eventSlug is required",
        path: ["eventSlug"],
      });
    }
  });

export const submitProofSchema = z.object({
  activityImageUrl: z
    .string()
    .min(12, "Activity image is required")
    .refine(
      (value) =>
        value.startsWith("https://") ||
        value.startsWith("http://localhost") ||
        value.startsWith("data:image/"),
      "Provide a public image URL or uploaded image data",
    ),
  sourceApp: z.string().min(2, "Source app is required"),
  finishTimeSeconds: z.number().int().positive().optional(),
});

export const reviewProofSchema = z.object({
  approved: z.boolean(),
  reviewerNote: z.string().optional(),
  finishTimeSeconds: z.number().int().positive().optional(),
});
