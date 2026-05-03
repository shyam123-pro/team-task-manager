import { useMemo } from "react";
import { useApp } from "@/store/AppStore";
import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function Analytics() {
  const { currentUser, dashboard } = useApp();
  const isAdmin = currentUser?.role === "admin";

  const statusData = useMemo(() => {
    const s = dashboard?.tasksByStatus;
    return [
      { name: "To Do", value: s?.todo ?? 0 },
      { name: "In Progress", value: s?.in_progress ?? 0 },
      { name: "Done", value: s?.done ?? 0 },
    ];
  }, [dashboard?.tasksByStatus]);

  const perUser = useMemo(() => {
    return (dashboard?.tasksPerUser ?? [])
      .slice(0, 10)
      .map((x) => ({ name: x.user.name, tasks: x.total }));
  }, [dashboard?.tasksPerUser]);

  if (!isAdmin) {
    return (
      <div className="glass rounded-md p-10 text-center text-sm text-muted-foreground">
        Analytics is available for admins only.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass rounded-md p-5 lg:col-span-1">
          <div className="font-bold mb-1">Tasks by Status</div>
          <div className="text-xs text-muted-foreground mb-4">Workspace snapshot</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-md p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <div className="font-bold">Tasks per User</div>
            <div className="text-xs text-muted-foreground">Top 10</div>
          </div>
          <div className="text-xs text-muted-foreground mb-4">Workload distribution</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perUser}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="tasks" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass rounded-md p-5">
        <div className="font-bold">Overdue</div>
        <div className="text-sm text-muted-foreground mt-1">
          {dashboard?.overdueTasks ?? 0} overdue tasks across your admin scope.
        </div>
      </div>
    </div>
  );
}

