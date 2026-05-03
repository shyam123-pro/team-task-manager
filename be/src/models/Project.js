import mongoose from "mongoose";

const ProjectMemberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["admin", "member"], required: true },
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: { type: [ProjectMemberSchema], default: [] },
  },
  { timestamps: true }
);

ProjectSchema.index({ createdBy: 1 });
ProjectSchema.index({ "members.user": 1 });

export const Project = mongoose.model("Project", ProjectSchema);

