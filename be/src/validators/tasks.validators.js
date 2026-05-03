import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(2).max(140),
  description: z.string().max(4000).optional().default(""),
  dueDate: z.string().min(1),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  assigneeId: z.string().nullable().optional(),
});

export const adminUpdateTaskSchema = z
  .object({
    title: z.string().min(2).max(140).optional(),
    description: z.string().max(4000).optional(),
    dueDate: z.string().optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    status: z.enum(["todo", "in_progress", "done"]).optional(),
    assigneeId: z.string().nullable().optional(),
  })
  .strict();

export const memberUpdateTaskSchema = z
  .object({
    status: z.enum(["todo", "in_progress", "done"]),
  })
  .strict();

