import mongoose from "mongoose";
import { z } from "zod";
import { User } from "../models/User.js";
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { Notification } from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";

export const listUsers = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 200), 500);
  const q = String(req.query.q || "").trim();

  const filter = {};
  if (q) {
    filter.$or = [{ email: { $regex: q, $options: "i" } }, { name: { $regex: q, $options: "i" } }];
  }

  const users = await User.find(filter).select("_id name email role createdAt updatedAt").sort({ createdAt: -1 }).limit(limit).lean();
  res.json({
    users: users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role || "member",
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    })),
  });
});

const updateUserSchema = z
  .object({
    name: z.string().min(2).max(80).optional(),
    email: z.string().email().optional(),
    role: z.enum(["admin", "member"]).optional(),
  })
  .refine((v) => !!v.name || !!v.email || !!v.role, { message: "Nothing to update" });

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, "Invalid user id");

  const body = updateUserSchema.parse(req.body);
  if (req.user.id === id && body.role && body.role !== "admin") throw new HttpError(400, "You cannot demote yourself");

  const update = {};
  if (body.name) update.name = body.name;
  if (body.email) update.email = body.email.toLowerCase();
  if (body.role) update.role = body.role;

  try {
    const user = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true }).select("_id name email role");
    if (!user) throw new HttpError(404, "User not found");
    res.json({ user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role || "member" } });
  } catch (err) {
    if (err && typeof err === "object" && err.code === 11000) throw new HttpError(409, "Email already in use");
    throw err;
  }
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, "Invalid user id");
  if (req.user.id === id) throw new HttpError(400, "You cannot delete yourself");

  const user = await User.findById(id).select("_id role").lean();
  if (!user) throw new HttpError(404, "User not found");

  if ((user.role || "member") === "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) throw new HttpError(400, "Cannot delete the last admin");
  }

  await Project.updateMany({}, { $pull: { members: { user: id } } });
  await Task.updateMany({ assignee: id }, { $set: { assignee: null } });
  await Notification.deleteMany({ user: id });

  await User.deleteOne({ _id: id });
  res.json({ ok: true });
});
