import jwt from "jsonwebtoken";
import ApiError from "./ApiError.js";
import { isProd } from "../config/env.js";

const getSecret = () => {
  if (!process.env.JWT_SECRET) throw new ApiError(500, "Server misconfigured: JWT_SECRET is not set");
  return process.env.JWT_SECRET;
};

export const signToken = (id) =>
  jwt.sign({ id }, getSecret(), { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

export const verifyToken = (token) => {
  const secret = getSecret();
  try {
    return jwt.verify(token, secret);
  } catch {
    throw new ApiError(401, "Invalid or expired token, please log in again");
  }
};

// Cross-site cookies (frontend and API on different Vercel domains) need SameSite=None + Secure.
export const cookieOptions = () => ({
  httpOnly: true,
  secure: isProd(),
  sameSite: isProd() ? "none" : "lax",
  maxAge: (Number(process.env.COOKIE_EXPIRES_DAYS) || 7) * 24 * 60 * 60 * 1000,
});

export const sendAuth = (res, user, statusCode = 200) => {
  const token = signToken(user._id);
  res.cookie("token", token, cookieOptions());
  res.status(statusCode).json({ status: "success", token, data: { user } });
};
