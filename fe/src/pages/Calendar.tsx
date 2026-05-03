import { useMemo } from "react";
import { useApp } from "@/store/AppStore";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { Link } from "react-router-dom";

function dateOnly(d: string) {
  return new Date(d).toISOString().slice(0, 10);
}

export default function Calendar() {
  const { tasks, activeProject } = useApp();

  const items = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .map((t) => ({ ...t, due: dateOnly(t.dueDate) }));
  }, [tasks]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const t of items) {
      const arr = map.get(t.due) || [];
      arr.push(t);
      map.set(t.due, arr);
    }
    return Array.from(map.entries());
  }, [items]);

  return (
    <div className="space-y-4">
      <div className="glass rounded-md p-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-bold flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-primary" /> Calendar
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Timeline of deadlines{activeProject ? ` for ${activeProject.name}` : ""}.
          </p>
        </div>
        <Link to="/tasks" className="text-xs text-primary font-medium hover:underline">
          Go to tasks →
        </Link>
      </div>

      {groups.length === 0 ? (
        <div className="glass rounded-md p-10 text-center text-sm text-muted-foreground">No tasks to show yet.</div>
      ) : (
        <div className="space-y-3">
          {groups.map(([due, list]) => (
            <div key={due} className="glass rounded-md overflow-hidden">
              <div className="p-4 border-b border-border/60 flex items-center justify-between">
                <div className="font-semibold">{due}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  {list.length} item{list.length === 1 ? "" : "s"}
                </div>
              </div>
              <div className="divide-y divide-border/50">
                {list.map((t) => (
                  <div key={t._id} className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{t.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {t.assignee ? `Assigned to ${t.assignee.name}` : "Unassigned"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={t.status} />
                      <PriorityBadge priority={t.priority} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

