import { error } from "../utils/responseFormatter.js";

/**
 * Centralised error handler — must be registered LAST in Express middleware chain.
 * Normalises all thrown errors into consistent JSON envelopes.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Joi validation errors arrive with err.isJoi = true
  if (err.isJoi || err.name === "ValidationError") {
    return res.status(400).json(
      error(
        "Validation failed",
        400,
        err.details?.map((d) => d.message) ?? [err.message]
      )
    );
  }

  // Known operational errors carry a statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json(error(err.message, err.statusCode));
  }

  // Fallback — unexpected errors
  const isDev = process.env.NODE_ENV !== "production";
  console.error("[ErrorHandler]", err);

  return res.status(500).json(
    error(
      isDev ? err.message : "Internal server error",
      500,
      isDev ? err.stack : undefined
    )
  );
};

export default errorHandler;
