import mongoose from "mongoose";
import { Notification } from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";

export const listMyNotifications = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 30), 100);
  const unreadOnly = String(req.query.unreadOnly || "false") === "true";

  const q = { user: req.user.id };
  if (unreadOnly) q.readAt = null;

  const items = await Notification.find(q)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("task", "_id title dueDate")
    .populate("project", "_id name")
    .lean();

  const unreadCount = await Notification.countDocuments({ user: req.user.id, readAt: null });

  res.json({ notifications: items, unreadCount });
});

export const markRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, "Invalid notification id");

  const n = await Notification.findOneAndUpdate(
    { _id: id, user: req.user.id },
    { readAt: new Date() },
    { new: true }
  ).lean();

  if (!n) throw new HttpError(404, "Notification not found");
  res.json({ ok: true });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user.id, readAt: null }, { $set: { readAt: new Date() } });
  res.json({ ok: true });
});

