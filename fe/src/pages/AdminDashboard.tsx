import { useApp } from "@/store/AppStore";
import { CheckCircle2, Clock, AlertTriangle, ListChecks, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { currentUser, activeProject, dashboard } = useApp();

  const stats = [
    { label: "Total Tasks", value: dashboard?.totalTasks ?? 0, icon: ListChecks, iconBg: "bg-primary/15 text-primary" },
    { label: "In Progress", value: dashboard?.tasksByStatus?.in_progress ?? 0, icon: Clock, iconBg: "bg-info/15 text-info" },
    { label: "Completed", value: dashboard?.tasksByStatus?.done ?? 0, icon: CheckCircle2, iconBg: "bg-teal/15 text-teal" },
    { label: "Overdue", value: dashboard?.overdueTasks ?? 0, icon: AlertTriangle, iconBg: "bg-coral/15 text-coral" },
  ];

  return (
    <div className="space-y-5">
      <div className="glass rounded-md p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/30 rounded-full blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
            Admin Workspace
          </div>
          <div className="text-2xl font-bold mt-2">Welcome back, {currentUser?.name?.split(" ")[0]}</div>
          <div className="text-sm text-muted-foreground">
            {activeProject ? <>Active project: <span className="font-semibold">{activeProject.name}</span></> : "Select a project to begin."}
          </div>
        </div>
        <div className="relative flex gap-6 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text">{activeProject?.members.length ?? 0}</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider flex items-center justify-center gap-1">
              <Users className="w-3 h-3" /> Members
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/projects">
              <Button size="sm" className="rounded-sm">New Project</Button>
            </Link>
            <Link to="/tasks">
              <Button size="sm" variant="outline" className="rounded-sm">New Task</Button>
            </Link>
          </div>
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

      <div className="glass rounded-md p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold">Workload</h2>
            <p className="text-xs text-muted-foreground">Tasks per user across your scope</p>
          </div>
          <Link to="/team" className="text-xs text-primary font-medium hover:underline">View team →</Link>
        </div>
        <div className="mt-4 space-y-2">
          {(dashboard?.tasksPerUser ?? []).slice(0, 8).map((x) => (
            <div key={x.user.id} className="flex items-center justify-between p-3 border border-border/60 rounded-md bg-white/50">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{x.user.name}</div>
                <div className="text-[11px] text-muted-foreground truncate">{x.user.email}</div>
              </div>
              <div className="font-bold tabular-nums">{x.total}</div>
            </div>
          ))}
          {(dashboard?.tasksPerUser?.length ?? 0) === 0 && (
            <div className="text-sm text-muted-foreground text-center py-8">No tasks yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
