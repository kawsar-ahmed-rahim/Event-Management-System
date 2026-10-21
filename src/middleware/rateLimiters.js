import rateLimit from "express-rate-limit";

// Stricter limit for login/register to slow down brute-force attempts.
// Note: the default memory store is per serverless instance; use a Redis store for strict global limits.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { status: "fail", message: "Too many attempts, please try again in 15 minutes" },
});
