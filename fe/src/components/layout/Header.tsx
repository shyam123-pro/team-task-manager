import { Bell, LogOut, Search, Menu } from "lucide-react";
import { useApp } from "@/store/AppStore";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/apiClient";
import { useLocation } from "react-router-dom";

export function Header({ title, subtitle, onMenuClick }: { title: string; subtitle?: string; onMenuClick: () => void }) {
  const { currentUser, logout, activeProject, notifications, unreadNotifications, refreshNotifications } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAdmin = currentUser?.role === "admin";
  const [search, setSearch] = useState("");
  const [signOutOpen, setSignOutOpen] = useState(false);
  const notifCount = unreadNotifications;

  const confirmSignOut = () => {
    logout();
    navigate("/login");
  };

  const onSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const base = pathname.startsWith("/projects") ? "/projects" : "/tasks";
      navigate(`${base}?q=${encodeURIComponent(search)}`);
    }
  };

  return (
    <header className="h-16 border-b border-border/60 glass flex items-center justify-between px-4 sm:px-6 shrink-0 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenuClick} aria-label="Open menu" className="lg:hidden p-2 hover:bg-muted rounded-md shrink-0">
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-foreground truncate">{title}</h1>
          {subtitle && <p className="text-[11px] sm:text-xs text-muted-foreground truncate hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="hidden md:flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-md border border-border/60 w-56 lg:w-64">
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={onSearch}
            placeholder="Search tasks..."
            className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground min-w-0"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Notifications"
              className="p-2 hover:bg-muted rounded-md relative"
              onClick={() => refreshNotifications().catch(() => {})}
            >
              <Bell className="w-4 h-4 text-muted-foreground" />
              {notifCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 text-[9px] font-bold px-1 bg-coral text-white rounded-full flex items-center justify-center">
                  {notifCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-md">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifCount === 0 && notifications.length === 0 && (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">You're all caught up 🎉</div>
            )}
            <div className="max-h-[320px] overflow-auto">
              {notifications.slice(0, 8).map((n) => {
                const ts = new Date(n.createdAt).toLocaleString();
                const unread = !n.readAt;
                return (
                  <DropdownMenuItem
                    key={n._id}
                    onClick={async () => {
                      try {
                        if (unread) await apiFetch(`/notifications/${n._id}/read`, { method: "PATCH" });
                        await refreshNotifications();
                        navigate("/tasks");
                      } catch (e: any) {
                        toast.error(e?.message || "Failed to open notification");
                      }
                    }}
                    className="flex flex-col items-start gap-0.5 cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`text-xs font-semibold ${unread ? "text-primary" : "text-muted-foreground"}`}>{n.title}</div>
                      <div className="text-[10px] text-muted-foreground">{ts}</div>
                    </div>
                    {n.body && <div className="text-sm">{n.body}</div>}
                    {n.project?.name && <div className="text-[10px] text-muted-foreground">{n.project.name}</div>}
                  </DropdownMenuItem>
                );
              })}
            </div>
            {notifications.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    try {
                      await apiFetch("/notifications/read-all", { method: "PATCH" });
                      await refreshNotifications();
                      toast.success("Marked all as read");
                    } catch (e: any) {
                      toast.error(e?.message || "Failed to mark read");
                    }
                  }}
                  className="cursor-pointer text-xs text-primary"
                >
                  Mark all as read
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="hidden sm:block h-8 w-px bg-border" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:bg-muted/60 rounded-md p-1 pr-2 transition">
              <div className="text-right hidden md:block max-w-[140px]">
                <div className="text-sm font-semibold leading-tight truncate">{currentUser?.name}</div>
                <div className={`text-[10px] uppercase tracking-wider font-bold ${isAdmin ? "text-primary" : "text-info"}`}>
                  {currentUser?.role || "member"}
                </div>
              </div>
              <div className={`w-9 h-9 rounded-md flex items-center justify-center text-xs font-bold shadow-md ${isAdmin ? "bg-gradient-mint text-primary-foreground" : "bg-gradient-to-br from-info to-violet text-white"}`}>
                {(currentUser?.name || "U").slice(0, 2).toUpperCase()}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-md w-48">
            <DropdownMenuLabel className="text-xs text-muted-foreground">{currentUser?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>My settings</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard")}>Dashboard</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSignOutOpen(true)} className="text-destructive">
              <LogOut className="w-3.5 h-3.5 mr-2" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          className="rounded-md hidden sm:inline-flex"
          aria-label="Sign out"
          onClick={() => setSignOutOpen(true)}
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      <AlertDialog open={signOutOpen} onOpenChange={setSignOutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>You will need to sign in again to use the app.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmSignOut}>
              Sign out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
