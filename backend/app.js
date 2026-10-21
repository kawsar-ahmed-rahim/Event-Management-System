import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import router from "./src/routes/api.js";
import { connectDB } from "./src/config/db.js";
import { getClientOrigins, isProd } from "./src/config/env.js";
import ApiError from "./src/utils/ApiError.js";
import asyncHandler from "./src/utils/asyncHandler.js";
import { notFound, errorHandler } from "./src/middleware/errorHandler.js";

const app = express();

// Vercel sits behind a proxy; needed for correct client IPs (rate limiting).
app.set("trust proxy", 1);
app.disable("x-powered-by");

// Security middleware
app.use(helmet());
app.use(
  cors({
    credentials: true,
    origin(origin, cb) {
      const allowed = getClientOrigins();
      if (!origin || allowed.includes(origin)) return cb(null, true);
      if (!isProd() && allowed.length === 0) return cb(null, true);
      cb(new ApiError(403, "Origin not allowed by CORS"));
    },
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { status: "fail", message: "Too many requests, please try again later" },
  })
);

// Health check (no database needed)
app.get("/", (req, res) => res.json({ status: "success", message: "Event Management API" }));
app.get("/api/v1/health", (req, res) =>
  res.json({ status: "success", uptime: process.uptime(), timestamp: new Date().toISOString() })
);

// Serverless-safe DB connection (cached between invocations)
const ensureDb = asyncHandler(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    throw new ApiError(503, "Database unavailable, please try again shortly");
  }
  next();
});

app.use("/api/v1", ensureDb, router);

app.use(notFound);
app.use(errorHandler);

export default app;
