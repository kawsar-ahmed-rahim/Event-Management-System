import express from "express";
import mongoose from "mongoose";

import { protect, optionalAuth, restrictTo } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiters.js";
import ApiError from "../utils/ApiError.js";
import {
  registerSchema,
  loginSchema,
  createEventSchema,
  updateEventSchema,
  listEventsQuerySchema,
  updateRoleSchema,
  pageQuerySchema,
} from "../validators/schemas.js";

import * as auth from "../controllers/authController.js";
import * as events from "../controllers/eventController.js";
import * as registrations from "../controllers/registrationController.js";
import * as admin from "../controllers/adminController.js";

const router = express.Router();

// Reject malformed ids early for every route containing :id
router.param("id", (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) return next(new ApiError(400, "Invalid id"));
  next();
});

// ----- Auth -----
router.post("/auth/register", authLimiter, validate(registerSchema), auth.register);
router.post("/auth/login", authLimiter, validate(loginSchema), auth.login);
router.post("/auth/logout", auth.logout);
router.get("/auth/me", protect, auth.me);

// ----- Events -----
router.get("/events", validate(listEventsQuerySchema, "query"), events.listEvents);
router.get("/events/mine", protect, restrictTo("organizer", "admin"), events.myEvents); // before /events/:id
router.get("/events/:id", optionalAuth, events.getEvent);
router.post("/events", protect, restrictTo("organizer", "admin"), validate(createEventSchema), events.createEvent);
router.patch("/events/:id", protect, restrictTo("organizer", "admin"), validate(updateEventSchema), events.updateEvent);
router.delete("/events/:id", protect, restrictTo("organizer", "admin"), events.deleteEvent);
router.get("/events/:id/attendees", protect, restrictTo("organizer", "admin"), events.eventAttendees);

// ----- Registrations -----
router.post("/events/:id/register", protect, registrations.registerForEvent);
router.delete("/events/:id/register", protect, registrations.cancelRegistration);
router.get("/registrations/me", protect, registrations.myRegistrations);

// ----- Admin -----
router.use("/admin", protect, restrictTo("admin"));
router.get("/admin/stats", admin.stats);
router.get("/admin/users", validate(pageQuerySchema, "query"), admin.listUsers);
router.patch("/admin/users/:id/role", validate(updateRoleSchema), admin.updateUserRole);

export default router;
