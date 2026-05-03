import { HttpError } from "../utils/httpError.js";
import { ZodError } from "zod";

export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error",
      details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }

  const statusCode = err instanceof HttpError ? err.statusCode : 500;
  const payload = {
    message: err?.message || "Internal Server Error",
  };

  if (err instanceof HttpError && err.details) payload.details = err.details;
  if (process.env.NODE_ENV !== "production" && err?.stack) payload.stack = err.stack;

  res.status(statusCode).json(payload);
}
