import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2).max(120),
});

export const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member"]).default("member"),
});

