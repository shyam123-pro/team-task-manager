import mongoose from "mongoose";
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { Notification } from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { adminUpdateTaskSchema, createTaskSchema, memberUpdateTaskSchema } from "../validators/tasks.validators.js";

function parseDate(dateStr) {
  const dt = new Date(dateStr);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

async function ensureAssigneeIsMember(projectId, assigneeId) {
  if (!assigneeId) return null;
  if (!mongoose.isValidObjectId(assigneeId)) throw new HttpError(400, "Invalid assignee id");

  const project = await Project.findById(projectId).select("_id members").lean();
  if (!project) throw new HttpError(404, "Project not found");

  const ok = project.members.some((m) => m.user.toString() === assigneeId);
  if (!ok) throw new HttpError(400, "Assignee must be a project member");
  return assigneeId;
}

export const createTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  if (!mongoose.isValidObjectId(projectId)) throw new HttpError(400, "Invalid project id");
  if (req.project?.memberRole !== "admin") throw new HttpError(403, "Admin only");

  const body = createTaskSchema.parse(req.body);
  const dueDate = parseDate(body.dueDate);
  if (!dueDate) throw new HttpError(400, "Invalid dueDate");

  const assignee = await ensureAssigneeIsMember(projectId, body.assigneeId ?? null);

  const task = await Task.create({
    project: projectId,
    title: body.title,
    description: body.description ?? "",
    dueDate,
    priority: body.priority,
    assignee,
    createdBy: req.user.id,
  });

  if (assignee) {
    await Notification.create({
      user: assignee,
      type: "task_created",
      title: "New task assigned",
      body: body.title,
      task: task._id,
      project: projectId,
    });
  }

  res.status(201).json({ task: await Task.findById(task._id).populate("assignee", "_id name email") });
});

export const listProjectTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  if (!mongoose.isValidObjectId(projectId)) throw new HttpError(400, "Invalid project id");

  const isAdmin = req.project?.memberRole === "admin";
  const q = { project: projectId };
  if (!isAdmin) q.assignee = req.user.id;

  const tasks = await Task.find(q)
    .sort({ dueDate: 1, createdAt: -1 })
    .populate("assignee", "_id name email")
    .lean();

  res.json({ tasks });
});

export const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, "Invalid task id");

  const task = await Task.findById(id).select("_id project assignee title").lean();
  if (!task) throw new HttpError(404, "Task not found");

  const project = await Project.findById(task.project).select("_id members").lean();
  if (!project) throw new HttpError(404, "Project not found");

  const userId = req.user.id;
  const member = project.members.find((m) => m.user.toString() === userId);
  if (!member) throw new HttpError(403, "Forbidden");

  const isAdmin = member.role === "admin";
  if (!isAdmin) {
    if (!task.assignee || task.assignee.toString() !== userId) throw new HttpError(403, "Members can only update their assigned tasks");
  }

  const body = isAdmin ? adminUpdateTaskSchema.parse(req.body) : memberUpdateTaskSchema.parse(req.body);
  const update = {};

  if (isAdmin) {
    if (typeof body.title === "string") update.title = body.title;
    if (typeof body.description === "string") update.description = body.description;
    if (typeof body.priority === "string") update.priority = body.priority;
    if (typeof body.status === "string") update.status = body.status;
    if (typeof body.dueDate === "string") {
      const dt = parseDate(body.dueDate);
      if (!dt) throw new HttpError(400, "Invalid dueDate");
      update.dueDate = dt;
    }
    if ("assigneeId" in body) {
      update.assignee = await ensureAssigneeIsMember(task.project.toString(), body.assigneeId ?? null);
    }
  } else {
    update.status = body.status;
  }

  const prevAssignee = task.assignee ? task.assignee.toString() : null;
  const nextAssignee = Object.prototype.hasOwnProperty.call(update, "assignee")
    ? (update.assignee ? String(update.assignee) : null)
    : prevAssignee;

  const updated = await Task.findByIdAndUpdate(id, update, { new: true }).populate("assignee", "_id name email");

  if (isAdmin && nextAssignee && nextAssignee !== prevAssignee) {
    await Notification.create({
      user: nextAssignee,
      type: "task_assigned",
      title: "Task assigned to you",
      body: update.title || task.title,
      task: id,
      project: task.project,
    });
  }

  res.json({ task: updated });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, "Invalid task id");

  const task = await Task.findById(id).select("_id project").lean();
  if (!task) throw new HttpError(404, "Task not found");

  const project = await Project.findById(task.project).select("_id members").lean();
  if (!project) throw new HttpError(404, "Project not found");

  const userId = req.user.id;
  const member = project.members.find((m) => m.user.toString() === userId);
  if (!member || member.role !== "admin") throw new HttpError(403, "Admin only");

  await Task.deleteOne({ _id: id });
  res.json({ ok: true });
});
