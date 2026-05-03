import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { addMember, createProject, deleteProject, getProject, listMyProjects, removeMember, updateProject } from "../controllers/projects.controller.js";

export const projectsRouter = Router();

projectsRouter.use(requireAuth);

projectsRouter.post("/", createProject);
projectsRouter.get("/", listMyProjects);
projectsRouter.get("/:id", getProject);
projectsRouter.patch("/:id", updateProject);
projectsRouter.delete("/:id", deleteProject);
projectsRouter.post("/:id/members", addMember);
projectsRouter.delete("/:id/members/:userId", removeMember);
