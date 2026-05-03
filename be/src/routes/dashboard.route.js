import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { getDashboard } from "../controllers/dashboard.controller.js";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);
dashboardRouter.get("/", getDashboard);

