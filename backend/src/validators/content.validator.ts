import { z } from "zod";

export const siteMediaSchema = z.object({
  title: z.string().trim().min(2).max(120),
  imageUrl: z.string().trim().min(1).max(2000),
  category: z.string().trim().min(2).max(40).optional(),
  location: z.string().trim().max(80).optional().nullable(),
  eventLabel: z.string().trim().max(120).optional().nullable(),
  dateLabel: z.string().trim().max(40).optional().nullable(),
  meta: z.string().trim().max(80).optional().nullable(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  published: z.boolean().optional(),
  showInGallery: z.boolean().optional(),
  showOnHomeMoments: z.boolean().optional(),
});

export const siteMediaUpdateSchema = siteMediaSchema.partial();

export const siteTestimonialSchema = z.object({
  name: z.string().trim().min(2).max(80),
  role: z.string().trim().min(2).max(80),
  city: z.string().trim().max(60).optional().nullable(),
  quote: z.string().trim().min(8).max(600),
  rating: z.number().int().min(1).max(5).optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  published: z.boolean().optional(),
  showOnHome: z.boolean().optional(),
});

export const siteTestimonialUpdateSchema = siteTestimonialSchema.partial();
