import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyToken } from "../utils/token.js";

const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return req.cookies?.token;
};

export const protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw new ApiError(401, "Please log in to continue");

  const payload = verifyToken(token);
  const user = await User.findById(payload.id);
  if (!user) throw new ApiError(401, "The account for this token no longer exists");

  req.user = user;
  next();
});

// Attaches req.user when a valid token is present, but never blocks the request.
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (token) {
    try {
      const payload = verifyToken(token);
      req.user = await User.findById(payload.id);
    } catch {
      req.user = undefined;
    }
  }
  next();
});

export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(new ApiError(403, "You do not have permission to perform this action"));
    }
    next();
  };
