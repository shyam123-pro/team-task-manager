import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function getTokenFromHeader(req) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");
  if (type === "Bearer" && token) return token;
  return null;
}

export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = getTokenFromHeader(req);
  if (!token) throw new HttpError(401, "Unauthorized");

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new HttpError(401, "Unauthorized");
  }

  const user = await User.findById(payload.sub).select("_id name email role");
  if (!user) throw new HttpError(401, "Unauthorized");

  req.user = { id: user._id.toString(), name: user.name, email: user.email, role: user.role || "member" };
  next();
});
