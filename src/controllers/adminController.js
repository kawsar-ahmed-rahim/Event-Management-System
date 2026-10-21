import User from "../models/User.js";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// GET /admin/stats
export const stats = asyncHandler(async (req, res) => {
  const now = new Date();
  const [users, events, upcomingEvents, registrations, usersByRole, eventsByCategory] = await Promise.all([
    User.countDocuments(),
    Event.countDocuments(),
    Event.countDocuments({ status: "published", endDate: { $gte: now } }),
    Registration.countDocuments({ status: "registered" }),
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    Event.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
  ]);

  res.json({
    status: "success",
    data: { users, events, upcomingEvents, registrations, usersByRole, eventsByCategory },
  });
});

// GET /admin/users
export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, role } = req.validatedQuery;
  const filter = role ? { role } : {};

  const [users, total] = await Promise.all([
    User.find(filter).sort("-createdAt").skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({
    status: "success",
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: { users },
  });
});

// PATCH /admin/users/:id/role
export const updateUserRole = asyncHandler(async (req, res) => {
  if (req.params.id === String(req.user._id)) {
    throw new ApiError(400, "You cannot change your own role");
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, "User not found");

  res.json({ status: "success", data: { user } });
});
