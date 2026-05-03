import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDb() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGO_URI, {
    serverSelectionTimeoutMS: 15_000,
    maxPoolSize: 10,
  });
  // eslint-disable-next-line no-console
  console.log("MongoDB connected");
}

