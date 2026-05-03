import { useApp } from "@/store/AppStore";
import { RoleBadge } from "@/components/StatusBadge";
import { Mail } from "lucide-react";

export default function Team() {
  const { activeProject, tasks } = useApp();
  const members = activeProject?.members ?? [];
  const isAdmin = activeProject?.myRole === "admin";

  return (
    <div className="space-y-4">
      {!activeProject ? (
        <div className="text-sm text-muted-foreground">Select a project to view members.</div>
      ) : (
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Email</th>
                {isAdmin && <th>Active Tasks</th>}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const active = isAdmin
                  ? tasks.filter((t) => t.assignee?.id === m.user.id && t.status !== "done").length
                  : 0;
                return (
                  <tr key={m.user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary text-primary-foreground rounded-sm flex items-center justify-center text-xs font-semibold">
                          {m.user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="font-medium">{m.user.name}</div>
                      </div>
                    </td>
                    <td>
                      <RoleBadge role={m.role} />
                    </td>
                    <td className="text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="w-3 h-3" />
                        {m.user.email}
                      </span>
                    </td>
                    {isAdmin && <td className="tabular-nums">{active}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

