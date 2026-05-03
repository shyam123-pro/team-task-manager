import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(200),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(200),
});

export const updateMeSchema = z
  .object({
    name: z.string().min(2).max(80).optional(),
    email: z.string().email().optional(),
  })
  .refine((v) => !!v.name || !!v.email, { message: "Nothing to update" });
