import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// POST /events/:id/register
export const registerForEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id);
  if (!event || event.status !== "published") throw new ApiError(404, "Event not found");
  if (event.endDate < new Date()) throw new ApiError(400, "This event has already ended");

  // Reserve a seat atomically so concurrent requests can never exceed capacity.
  const reserved = await Event.findOneAndUpdate(
    { _id: id, status: "published", $expr: { $lt: ["$registeredCount", "$capacity"] } },
    { $inc: { registeredCount: 1 } },
    { new: true }
  );
  if (!reserved) throw new ApiError(409, "Sorry, this event is full");

  try {
    // Re-activate a previously cancelled registration, otherwise create a new one.
    let registration = await Registration.findOneAndUpdate(
      { event: id, user: req.user._id, status: "cancelled" },
      { status: "registered" },
      { new: true }
    );
    if (!registration) registration = await Registration.create({ event: id, user: req.user._id });

    res.status(201).json({ status: "success", data: { registration, event: reserved } });
  } catch (err) {
    await Event.updateOne({ _id: id }, { $inc: { registeredCount: -1 } }); // release the seat
    if (err.code === 11000) throw new ApiError(409, "You are already registered for this event");
    throw err;
  }
});

// DELETE /events/:id/register
export const cancelRegistration = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const registration = await Registration.findOneAndUpdate(
    { event: id, user: req.user._id, status: "registered" },
    { status: "cancelled" }
  );
  if (!registration) throw new ApiError(404, "You are not registered for this event");

  await Event.updateOne({ _id: id, registeredCount: { $gt: 0 } }, { $inc: { registeredCount: -1 } });
  res.json({ status: "success", message: "Registration cancelled" });
});

// GET /registrations/me
export const myRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ user: req.user._id, status: "registered" })
    .populate("event")
    .sort("-createdAt");

  res.json({
    status: "success",
    results: registrations.length,
    data: { registrations: registrations.filter((r) => r.event) },
  });
});
