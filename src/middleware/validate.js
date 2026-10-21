import ApiError from "../utils/ApiError.js";

// validate(schema, "body" | "query"). Parsed query is exposed as req.validatedQuery.
export const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
      return next(new ApiError(400, "Validation failed", errors));
    }
    if (source === "query") req.validatedQuery = result.data;
    else req[source] = result.data;
    next();
  };
