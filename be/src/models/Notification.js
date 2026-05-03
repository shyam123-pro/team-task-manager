import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["task_assigned", "task_created"], required: true },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    body: { type: String, default: "", maxlength: 500 },
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null, index: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null, index: true },
    readAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

NotificationSchema.index({ user: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", NotificationSchema);

