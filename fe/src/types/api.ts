export type ProjectRole = "admin" | "member";

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
}

export interface ApiProjectListItem {
  id: string;
  name: string;
  role: ProjectRole;
  createdAt: string;
  updatedAt: string;
  membersCount?: number;
}

export interface ApiProjectDetail {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  myRole: ProjectRole;
  members: Array<{ user: ApiUser; role: ProjectRole }>;
}

export interface ApiTask {
  _id: string;
  project: string;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee: ApiUser | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardResponse {
  totalTasks: number;
  tasksByStatus: Record<TaskStatus, number>;
  tasksPerUser: Array<{ user: ApiUser; total: number }>;
  overdueTasks: number;
}

export type NotificationType = "task_assigned" | "task_created";

export interface ApiNotification {
  _id: string;
  user: string;
  type: NotificationType;
  title: string;
  body: string;
  task?: { _id: string; title: string; dueDate: string } | null;
  project?: { _id: string; name: string } | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: ApiNotification[];
  unreadCount: number;
}
