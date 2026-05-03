import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 140 },
    description: { type: String, default: "", maxlength: 4000 },
    dueDate: { type: Date, required: true },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["todo", "in_progress", "done"], default: "todo" },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

TaskSchema.index({ project: 1, status: 1 });

export const Task = mongoose.model("Task", TaskSchema);

