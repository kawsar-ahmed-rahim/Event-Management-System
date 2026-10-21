import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendAuth, cookieOptions } from "../utils/token.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (await User.exists({ email })) throw new ApiError(409, "Email is already registered");

  const user = await User.create({ name, email, password, role: role || "user" });
  sendAuth(res, user, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  // Same message for unknown email and wrong password (don't leak which accounts exist).
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }
  sendAuth(res, user);
});

export const logout = (req, res) => {
  const { maxAge, ...opts } = cookieOptions();
  res.clearCookie("token", opts);
  res.json({ status: "success", message: "Logged out" });
};

export const me = (req, res) => {
  res.json({ status: "success", data: { user: req.user } });
};
