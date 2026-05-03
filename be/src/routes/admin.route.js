import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireGlobalAdmin } from "../middleware/requireGlobalAdmin.js";
import { deleteUser, listUsers, updateUser } from "../controllers/admin.controller.js";

export const adminRouter = Router();

adminRouter.use(requireAuth);
adminRouter.use(requireGlobalAdmin);

adminRouter.get("/users", listUsers);
adminRouter.patch("/users/:id", updateUser);
adminRouter.delete("/users/:id", deleteUser);
