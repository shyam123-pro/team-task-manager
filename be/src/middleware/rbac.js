import mongoose from "mongoose";
import { Project } from "../models/Project.js";
import { HttpError } from "../utils/httpError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const requireProjectMember = asyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId || req.params.id;
  if (!projectId || !mongoose.isValidObjectId(projectId)) throw new HttpError(400, "Invalid project id");

  const project = await Project.findById(projectId).select("_id createdBy members");
  if (!project) throw new HttpError(404, "Project not found");

  const userId = req.user.id;
  const member = project.members.find((m) => m.user.toString() === userId);
  if (!member) throw new HttpError(403, "Forbidden");

  req.project = { id: project._id.toString(), memberRole: member.role };
  next();
});

export function requireProjectAdmin(req, res, next) {
  if (!req.project?.memberRole) throw new HttpError(500, "RBAC context missing");
  if (req.project.memberRole !== "admin") throw new HttpError(403, "Admin only");
  next();
}

