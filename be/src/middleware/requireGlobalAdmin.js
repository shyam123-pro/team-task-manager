import { HttpError } from "../utils/httpError.js";

export function requireGlobalAdmin(req, res, next) {
  if (!req.user?.role) throw new HttpError(401, "Unauthorized");
  if (req.user.role !== "admin") throw new HttpError(403, "Admin only");
  next();
}

