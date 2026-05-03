import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";

import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { ensureAdminUser } from "./seed/ensureAdminUser.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.route.js";
import { projectsRouter } from "./routes/projects.route.js";
import { tasksRouter } from "./routes/tasks.route.js";
import { dashboardRouter } from "./routes/dashboard.route.js";
import { notificationsRouter } from "./routes/notifications.route.js";
import { adminRouter } from "./routes/admin.route.js";

let preparePromise = null;
export function prepareApp() {
  if (!preparePromise) {
    preparePromise = (async () => {
      await connectDb();
      await ensureAdminUser();
    })();
  }
  return preparePromise;
}

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 204,
  })
);
app.options("*", cors());
app.use(express.json({ limit: "1mb" }));
app.use(mongoSanitize());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use(async (req, res, next) => {
  if (req.method === "OPTIONS") return next();
  try {
    await prepareApp();
    next();
  } catch (err) {
    next(err);
  }
});

app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/admin", adminRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
