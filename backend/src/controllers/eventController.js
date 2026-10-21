import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const SORTS = {
  startDate: { startDate: 1 },
  "-startDate": { startDate: -1 },
  price: { price: 1 },
  "-price": { price: -1 },
  newest: { createdAt: -1 },
};

const isAdmin = (user) => user?.role === "admin";
const ownsEvent = (event, user) => {
  const organizerId = event.organizer?._id || event.organizer;
  return Boolean(user) && organizerId.equals(user._id);
};
const assertCanManage = (event, user) => {
  if (!isAdmin(user) && !ownsEvent(event, user)) {
    throw new ApiError(403, "You can only manage your own events");
  }
};

const findEventOr404 = async (id) => {
  const event = await Event.findById(id);
  if (!event) throw new ApiError(404, "Event not found");
  return event;
};

// GET /events  (public)
export const listEvents = asyncHandler(async (req, res) => {
  const q = req.validatedQuery;
  const now = new Date();

  const filter = { status: "published" };
  filter.endDate = q.past === "true" ? { $lt: now } : { $gte: now };

  if (q.from || q.to) {
    filter.startDate = {};
    if (q.from) filter.startDate.$gte = q.from;
    if (q.to) filter.startDate.$lte = q.to;
  }
  if (q.category) filter.category = q.category;
  if (q.city) filter.city = new RegExp(`^${escapeRegex(q.city)}$`, "i");
  if (q.free === "true") filter.price = 0;
  if (q.free === "false") filter.price = { $gt: 0 };
  if (q.search) {
    const rx = new RegExp(escapeRegex(q.search), "i");
    filter.$or = [{ title: rx }, { venue: rx }, { city: rx }];
  }

  const skip = (q.page - 1) * q.limit;
  const [events, total] = await Promise.all([
    Event.find(filter).sort(SORTS[q.sort]).skip(skip).limit(q.limit).populate("organizer", "name"),
    Event.countDocuments(filter),
  ]);

  res.json({
    status: "success",
    results: events.length,
    pagination: { page: q.page, limit: q.limit, total, pages: Math.ceil(total / q.limit) },
    data: { events },
  });
});

// GET /events/:id  (public; drafts visible to owner/admin only)
export const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate("organizer", "name");
  if (!event) throw new ApiError(404, "Event not found");

  const canManage = isAdmin(req.user) || ownsEvent(event, req.user);
  if (event.status === "draft" && !canManage) throw new ApiError(404, "Event not found");

  const isRegistered = req.user
    ? Boolean(await Registration.exists({ event: event._id, user: req.user._id, status: "registered" }))
    : false;

  res.json({ status: "success", data: { event: { ...event.toJSON(), isRegistered, canManage } } });
});

// POST /events  (organizer, admin)
export const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create({ ...req.body, organizer: req.user._id });
  res.status(201).json({ status: "success", data: { event } });
});

// PATCH /events/:id  (owner, admin)
export const updateEvent = asyncHandler(async (req, res) => {
  const event = await findEventOr404(req.params.id);
  assertCanManage(event, req.user);

  const startDate = req.body.startDate ?? event.startDate;
  const endDate = req.body.endDate ?? event.endDate;
  if (endDate < startDate) throw new ApiError(400, "endDate must be after startDate");

  if (req.body.capacity !== undefined && req.body.capacity < event.registeredCount) {
    throw new ApiError(400, `Capacity cannot be lower than current registrations (${event.registeredCount})`);
  }

  event.set(req.body);
  await event.save();
  res.json({ status: "success", data: { event } });
});

// DELETE /events/:id  (owner, admin)
export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await findEventOr404(req.params.id);
  assertCanManage(event, req.user);

  await Registration.deleteMany({ event: event._id });
  await event.deleteOne();
  res.status(204).send();
});

// GET /events/mine  (organizer, admin)
export const myEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user._id }).sort("-createdAt");
  res.json({ status: "success", results: events.length, data: { events } });
});

// GET /events/:id/attendees  (owner, admin)
export const eventAttendees = asyncHandler(async (req, res) => {
  const event = await findEventOr404(req.params.id);
  assertCanManage(event, req.user);

  const registrations = await Registration.find({ event: event._id, status: "registered" })
    .populate("user", "name email")
    .sort("createdAt");

  res.json({ status: "success", results: registrations.length, data: { attendees: registrations } });
});
