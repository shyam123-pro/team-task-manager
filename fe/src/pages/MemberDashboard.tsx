import { useApp } from "@/store/AppStore";
import { CheckCircle2, Clock, AlertTriangle, ListChecks } from "lucide-react";
import { Link } from "react-router-dom";
import { PriorityBadge, StatusBadge } from "@/components/StatusBadge";

export default function MemberDashboard() {
  const { currentUser, activeProject, tasks, dashboard } = useApp();

  const active = tasks.filter((t) => t.status !== "done");
  const upcoming = [...active]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const stats = [
    { label: "My Tasks", value: dashboard?.totalTasks ?? tasks.length, icon: ListChecks, iconBg: "bg-primary/15 text-primary" },
    { label: "In Progress", value: dashboard?.tasksByStatus?.in_progress ?? tasks.filter((t) => t.status === "in_progress").length, icon: Clock, iconBg: "bg-info/15 text-info" },
    { label: "Done", value: dashboard?.tasksByStatus?.done ?? tasks.filter((t) => t.status === "done").length, icon: CheckCircle2, iconBg: "bg-teal/15 text-teal" },
    { label: "Overdue", value: dashboard?.overdueTasks ?? 0, icon: AlertTriangle, iconBg: "bg-coral/15 text-coral" },
  ];

  return (
    <div className="space-y-5">
      <div className="glass rounded-md p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-info/30 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-info/15 text-info">
              Member Workspace
            </div>
            <div className="text-2xl font-bold mt-2">Hi {currentUser?.name?.split(" ")[0]}</div>
            <div className="text-sm text-muted-foreground">
              {activeProject ? <>Active project: <span className="font-semibold">{activeProject.name}</span></> : "Select a project to begin."}
            </div>
          </div>
          <Link to="/tasks" className="text-xs text-primary font-medium hover:underline">Go to tasks →</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card bg-gradient-to-br from-white/60 to-white/10">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{s.label}</div>
                <div className="text-3xl font-bold mt-2">{s.value}</div>
              </div>
              <div className={`w-10 h-10 rounded-md flex items-center justify-center ${s.iconBg}`}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-md overflow-hidden">
        <div className="p-5 border-b border-border/60 flex items-center justify-between">
          <div>
            <h2 className="font-bold">Upcoming</h2>
            <p className="text-xs text-muted-foreground">Your nearest due dates (active project)</p>
          </div>
          <Link to="/tasks" className="text-xs text-primary font-medium hover:underline">All →</Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No upcoming tasks.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table min-w-[700px]">
              <thead>
                <tr><th>Task</th><th>Status</th><th>Priority</th><th>Due</th></tr>
              </thead>
              <tbody>
                {upcoming.map((t) => (
                  <tr key={t._id}>
                    <td className="font-medium">{t.title}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td><PriorityBadge priority={t.priority} /></td>
                    <td className="tabular-nums">{new Date(t.dueDate).toISOString().slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
