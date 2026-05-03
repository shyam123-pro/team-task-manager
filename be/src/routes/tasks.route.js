import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireProjectMember } from "../middleware/rbac.js";
import { createTask, deleteTask, listProjectTasks, updateTask } from "../controllers/tasks.controller.js";

export const tasksRouter = Router();

tasksRouter.use(requireAuth);

tasksRouter.get("/project/:projectId", requireProjectMember, listProjectTasks);
tasksRouter.post("/project/:projectId", requireProjectMember, createTask);
tasksRouter.patch("/:id", updateTask);
tasksRouter.delete("/:id", deleteTask);

