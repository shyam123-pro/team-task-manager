import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, FolderKanban, ListChecks, Users, Settings, Layers,
  ShieldCheck, Inbox, Calendar, BarChart3, UserCog, Bookmark, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/store/AppStore";

const adminItems = [
  { to: "/dashboard", label: "Admin Dashboard", icon: LayoutDashboard, group: "Overview" },
  { to: "/analytics", label: "Analytics", icon: BarChart3, group: "Overview" },
  { to: "/projects", label: "Projects", icon: FolderKanban, group: "Manage" },
  { to: "/tasks", label: "All Tasks", icon: ListChecks, group: "Manage" },
  { to: "/team", label: "Team & Roles", icon: UserCog, group: "Manage" },
  { to: "/admin/users", label: "Users", icon: Users, group: "Manage" },
  { to: "/settings", label: "Workspace Settings", icon: Settings, group: "Account" },
];

const memberItems = [
  { to: "/dashboard", label: "My Dashboard", icon: LayoutDashboard, group: "Personal" },
  { to: "/my-tasks", label: "My Tasks", icon: Inbox, group: "Personal" },
  { to: "/calendar", label: "My Calendar", icon: Calendar, group: "Personal" },
  { to: "/projects", label: "Projects", icon: FolderKanban, group: "Workspace" },
  { to: "/team", label: "Teammates", icon: Users, group: "Workspace" },
  { to: "/bookmarks", label: "Bookmarks", icon: Bookmark, group: "Workspace" },
  { to: "/settings", label: "My Settings", icon: Settings, group: "Account" },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { currentUser } = useApp();
  const isAdmin = currentUser?.role === "admin";
  const items = isAdmin ? adminItems : memberItems;

  const grouped = items.reduce<Record<string, typeof items>>((acc, it) => {
    (acc[it.group] ||= []).push(it);
    return acc;
  }, {});

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />
      <aside
        className={cn(
          "fixed lg:static z-50 top-0 left-0 h-full w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border shrink-0 transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-16 flex items-center justify-between gap-2 px-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-mint rounded-md flex items-center justify-center shadow-md">
              <Layers className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <div className="text-sidebar-accent-foreground font-bold text-sm leading-tight">Team Task Manager</div>
              <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60 flex items-center gap-1">
                {isAdmin ? <><ShieldCheck className="w-2.5 h-2.5" />Admin</> : <><Users className="w-2.5 h-2.5" />Member</>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-sidebar-accent rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
          {Object.entries(grouped).map(([group, list]) => (
            <div key={group}>
              <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50 px-3 py-2">{group}</div>
              <div className="space-y-1">
                {list.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/30"
                          : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="rounded-md p-3 bg-gradient-to-br from-primary/20 to-info/20 border border-white/10">
            <div className="text-xs font-semibold text-sidebar-accent-foreground">{isAdmin ? "Admin tools active" : "Stay productive"}</div>
            <div className="text-[11px] text-sidebar-foreground/70 mt-0.5">
              {isAdmin ? "Full workspace control" : "Focus on what matters"}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
