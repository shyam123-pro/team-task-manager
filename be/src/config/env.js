import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const EnvSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.string().default("development"),
  MONGO_URI: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
});

function missingEnvMessage(zodError) {
  const names = zodError.issues.map((i) => (i.path.length ? i.path.join(".") : "?"));
  const unique = [...new Set(names)];
  return (
    `Invalid or missing environment variables: ${unique.join(", ")}. ` +
    "For Vercel: open this backend project → Settings → Environment Variables, add MONGO_URI and JWT_SECRET " +
    "(and redeploy). Local: copy be/.env.example to be/.env. " +
    "Do not commit secrets; .env is gitignored."
  );
}

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(missingEnvMessage(parsed.error));
}

export const env = parsed.data;

