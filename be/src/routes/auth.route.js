import { Router } from "express";
import { login, me, signup, updateMe } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/me", requireAuth, me);
authRouter.patch("/me", requireAuth, updateMe);
