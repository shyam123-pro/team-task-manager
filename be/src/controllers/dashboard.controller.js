import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function isoDateOnly(d) {
  const dt = new Date(d);
  const iso = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()));
  return iso;
}

export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const projects = await Project.find({ "members.user": userId }).select("_id members").lean();

  const projectIds = projects.map((p) => p._id.toString());
  const adminProjectIds = projects
    .filter((p) => p.members.some((m) => m.user.toString() === userId && m.role === "admin"))
    .map((p) => p._id.toString());
  const memberProjectIds = projectIds.filter((id) => !adminProjectIds.includes(id));

  const scopeOr = [];
  if (adminProjectIds.length) scopeOr.push({ project: { $in: adminProjectIds } });
  if (memberProjectIds.length) scopeOr.push({ project: { $in: memberProjectIds }, assignee: userId });

  const tasks = scopeOr.length
    ? await Task.find({ $or: scopeOr }).select("status dueDate assignee project").populate("assignee", "_id name email").lean()
    : [];

  const today = isoDateOnly(new Date());

  const total = tasks.length;
  const byStatus = { todo: 0, in_progress: 0, done: 0 };
  const perUser = {};
  let overdue = 0;

  for (const t of tasks) {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    if (t.assignee?._id) {
      const key = t.assignee._id.toString();
      perUser[key] ||= { user: { id: key, name: t.assignee.name, email: t.assignee.email }, total: 0 };
      perUser[key].total += 1;
    }
    if (t.status !== "done" && isoDateOnly(t.dueDate) < today) overdue += 1;
  }

  res.json({
    totalTasks: total,
    tasksByStatus: byStatus,
    tasksPerUser: Object.values(perUser),
    overdueTasks: overdue,
  });
});

