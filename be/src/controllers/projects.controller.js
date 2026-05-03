import mongoose from "mongoose";
import { Project } from "../models/Project.js";
import { User } from "../models/User.js";
import { Task } from "../models/Task.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { addMemberSchema, createProjectSchema } from "../validators/projects.validators.js";

export const createProject = asyncHandler(async (req, res) => {
  const body = createProjectSchema.parse(req.body);
  const userId = req.user.id;

  const project = await Project.create({
    name: body.name,
    createdBy: userId,
    members: [{ user: userId, role: "admin" }],
  });

  res.status(201).json({
    project: { id: project._id.toString(), name: project.name, role: "admin", createdAt: project.createdAt },
  });
});

export const listMyProjects = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const projects = await Project.find({ "members.user": userId })
    .select("_id name members createdAt updatedAt")
    .sort({ updatedAt: -1 })
    .lean();

  const shaped = projects.map((p) => {
    const member = p.members.find((m) => m.user.toString() === userId);
    return {
      id: p._id.toString(),
      name: p.name,
      role: member?.role || "member",
      membersCount: p.members.length,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  });

  res.json({ projects: shaped });
});

export const getProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, "Invalid project id");

  const userId = req.user.id;
  const project = await Project.findById(id).select("_id name createdBy members createdAt updatedAt").populate("members.user", "_id name email");
  if (!project) throw new HttpError(404, "Project not found");

  const member = project.members.find((m) => m.user._id.toString() === userId);
  if (!member) throw new HttpError(403, "Forbidden");

  res.json({
    project: {
      id: project._id.toString(),
      name: project.name,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      myRole: member.role,
      members: project.members.map((m) => ({
        user: { id: m.user._id.toString(), name: m.user.name, email: m.user.email },
        role: m.role,
      })),
    },
  });
});

export const addMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, "Invalid project id");

  const body = addMemberSchema.parse(req.body);

  const project = await Project.findById(id).select("_id members");
  if (!project) throw new HttpError(404, "Project not found");

  const actorId = req.user.id;
  const actor = project.members.find((m) => m.user.toString() === actorId);
  if (!actor || actor.role !== "admin") throw new HttpError(403, "Admin only");

  const user = await User.findOne({ email: body.email.toLowerCase() }).select("_id name email");
  if (!user) throw new HttpError(404, "User not found");

  const already = project.members.some((m) => m.user.toString() === user._id.toString());
  if (already) throw new HttpError(409, "User already a member");

  project.members.push({ user: user._id, role: body.role });
  await project.save();

  res.status(201).json({
    member: { user: { id: user._id.toString(), name: user.name, email: user.email }, role: body.role },
  });
});

export const removeMember = asyncHandler(async (req, res) => {
  const { id, userId } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, "Invalid project id");
  if (!mongoose.isValidObjectId(userId)) throw new HttpError(400, "Invalid user id");

  const project = await Project.findById(id).select("_id createdBy members");
  if (!project) throw new HttpError(404, "Project not found");

  const actorId = req.user.id;
  const actor = project.members.find((m) => m.user.toString() === actorId);
  if (!actor || actor.role !== "admin") throw new HttpError(403, "Admin only");

  if (actorId === userId) throw new HttpError(400, "Admin cannot remove self");

  const before = project.members.length;
  project.members = project.members.filter((m) => m.user.toString() !== userId);
  if (project.members.length === before) throw new HttpError(404, "Member not found");

  await project.save();
  res.json({ ok: true });
});

export const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, "Invalid project id");

  const body = createProjectSchema.parse(req.body);
  const project = await Project.findById(id).select("_id members name");
  if (!project) throw new HttpError(404, "Project not found");

  const actor = project.members.find((m) => m.user.toString() === req.user.id);
  if (!actor || actor.role !== "admin") throw new HttpError(403, "Admin only");

  project.name = body.name;
  await project.save();
  res.json({ project: { id: project._id.toString(), name: project.name } });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, "Invalid project id");

  const project = await Project.findById(id).select("_id members");
  if (!project) throw new HttpError(404, "Project not found");

  const actor = project.members.find((m) => m.user.toString() === req.user.id);
  if (!actor || actor.role !== "admin") throw new HttpError(403, "Admin only");

  await Task.deleteMany({ project: id });
  await Project.deleteOne({ _id: id });
  res.json({ ok: true });
});
