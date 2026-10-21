import { z } from "zod";
import { CATEGORIES } from "../models/Event.js";
import { ROLES } from "../models/User.js";

// ----- Auth -----
export const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().toLowerCase().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters")
    .regex(/[A-Za-z]/, "Password must contain a letter")
    .regex(/\d/, "Password must contain a number"),
  // Admins can't be self-created; use `npm run seed:admin`.
  role: z.enum(["user", "organizer"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, "Password is required"),
});

// ----- Events -----
const imageUrl = z
  .union([
    z.literal(""),
    z
      .string()
      .trim()
      .url()
      .max(500)
      .refine((u) => /^https?:\/\//i.test(u), "Image URL must start with http:// or https://"),
  ])
  .optional();

const eventBase = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(1).max(5000),
  category: z.enum(CATEGORIES),
  venue: z.string().trim().min(1).max(200),
  city: z.string().trim().min(1).max(80),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  price: z.coerce.number().min(0),
  capacity: z.coerce.number().int().min(1).max(100000),
  imageUrl,
});

export const createEventSchema = eventBase
  .extend({
    category: z.enum(CATEGORIES).default("other"),
    price: z.coerce.number().min(0).default(0),
    status: z.enum(["draft", "published"]).default("published"),
  })
  .refine((d) => d.endDate >= d.startDate, { message: "endDate must be after startDate", path: ["endDate"] })
  .refine((d) => d.startDate > new Date(), { message: "startDate must be in the future", path: ["startDate"] });

export const updateEventSchema = eventBase
  .partial()
  .extend({ status: z.enum(["draft", "published", "cancelled"]).optional() })
  .refine((d) => Object.keys(d).length > 0, { message: "Provide at least one field to update" });

export const listEventsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  search: z.string().trim().max(100).optional(),
  category: z.enum(CATEGORIES).optional(),
  city: z.string().trim().max(80).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  free: z.enum(["true", "false"]).optional(),
  past: z.enum(["true", "false"]).default("false"),
  sort: z.enum(["startDate", "-startDate", "price", "-price", "newest"]).default("startDate"),
});

// ----- Admin -----
export const updateRoleSchema = z.object({ role: z.enum(ROLES) });

export const pageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.enum(ROLES).optional(),
});
