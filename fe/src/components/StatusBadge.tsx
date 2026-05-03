import type { TaskPriority, TaskStatus } from "@/types/api";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const styles: Record<TaskStatus, string> = {
    todo: "bg-muted text-muted-foreground border-border",
    in_progress: "bg-info/10 text-info border-info/30",
    done: "bg-success/10 text-success border-success/30",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-sm border", styles[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const styles: Record<TaskPriority, string> = {
    low: "bg-muted text-muted-foreground border-border",
    medium: "bg-warning/10 text-warning border-warning/30",
    high: "bg-destructive/10 text-destructive border-destructive/30",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-sm border", styles[priority])}>
      <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5",
        priority === "high" ? "bg-destructive" : priority === "medium" ? "bg-warning" : "bg-muted-foreground"
      )} />
      {PRIORITY_LABEL[priority]}
    </span>
  );
}

export function RoleBadge({ role }: { role: "admin" | "member" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm border",
        role === "admin"
          ? "bg-primary/10 text-primary border-primary/30"
          : "bg-muted text-muted-foreground border-border"
      )}
    >
      {role}
    </span>
  );
}
