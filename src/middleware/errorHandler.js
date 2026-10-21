import ApiError from "../utils/ApiError.js";
import { isProd } from "../config/env.js";

export const notFound = (req, res, next) =>
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message;
  let errors = err.errors;

  if (err.name === "ValidationError" && err.errors && !(err instanceof ApiError)) {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = `Duplicate value for: ${Object.keys(err.keyValue || {}).join(", ") || "unique field"}`;
  } else if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON body";
  } else if (err.type === "entity.too.large") {
    statusCode = 413;
    message = "Request body too large";
  } else if (!(err instanceof ApiError)) {
    statusCode = 500;
  }

  if (statusCode >= 500) {
    console.error(err);
    if (!(err instanceof ApiError)) message = "Something went wrong on our side";
  }

  res.status(statusCode).json({
    status: statusCode >= 500 ? "error" : "fail",
    message,
    ...(errors && { errors }),
    ...(!isProd() && statusCode >= 500 && { stack: err.stack }),
  });
};
