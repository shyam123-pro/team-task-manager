import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { listMyNotifications, markAllRead, markRead } from "../controllers/notifications.controller.js";

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get("/", listMyNotifications);
notificationsRouter.patch("/:id/read", markRead);
notificationsRouter.patch("/read-all", markAllRead);

