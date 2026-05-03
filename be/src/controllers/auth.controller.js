import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { loginSchema, signupSchema, updateMeSchema } from "../validators/auth.validators.js";

function signToken(userId) {
  return jwt.sign({}, env.JWT_SECRET, { subject: userId, expiresIn: env.JWT_EXPIRES_IN });
}

export const signup = asyncHandler(async (req, res) => {
  const body = signupSchema.parse(req.body);

  const exists = await User.findOne({ email: body.email.toLowerCase() }).select("_id");
  if (exists) throw new HttpError(409, "Email already in use");

  const passwordHash = await bcrypt.hash(body.password, 10);
  const user = await User.create({ name: body.name, email: body.email.toLowerCase(), passwordHash, role: "member" });

  const token = signToken(user._id.toString());
  res.status(201).json({ token, user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role || "member" } });
});

export const login = asyncHandler(async (req, res) => {
  const body = loginSchema.parse(req.body);

  const user = await User.findOne({ email: body.email.toLowerCase() }).select("_id name email role passwordHash");
  if (!user) throw new HttpError(401, "Invalid credentials");

  const ok = await bcrypt.compare(body.password, user.passwordHash);
  if (!ok) throw new HttpError(401, "Invalid credentials");

  const token = signToken(user._id.toString());
  res.json({ token, user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role || "member" } });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

export const updateMe = asyncHandler(async (req, res) => {
  const body = updateMeSchema.parse(req.body);

  const update = {};
  if (body.name) update.name = body.name;
  if (body.email) update.email = body.email.toLowerCase();

  try {
    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true, runValidators: true }).select("_id name email role");
    if (!user) throw new HttpError(401, "Unauthorized");
    res.json({ user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role || "member" } });
  } catch (err) {
    if (err && typeof err === "object" && err.code === 11000) {
      throw new HttpError(409, "Email already in use");
    }
    throw err;
  }
});
