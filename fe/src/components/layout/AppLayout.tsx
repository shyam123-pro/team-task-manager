import { useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useApp } from "@/store/AppStore";

const titleMap: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Overview of your team's activity" },
  "/analytics": { title: "Analytics", subtitle: "Workspace-wide performance insights" },
  "/projects": { title: "Projects", subtitle: "Manage projects and team membership" },
  "/tasks": { title: "All Tasks", subtitle: "Track and update task progress" },
  "/my-tasks": { title: "My Tasks", subtitle: "Tasks assigned to you" },
  "/calendar": { title: "Calendar", subtitle: "Your upcoming deadlines" },
  "/team": { title: "Team", subtitle: "View members and their roles" },
  "/bookmarks": { title: "Bookmarks", subtitle: "Saved tasks and projects" },
  "/settings": { title: "Settings", subtitle: "Workspace and account preferences" },
};

export function AppLayout() {
  const { currentUser, isReady } = useApp();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isReady) return null;
  if (!currentUser) return <Navigate to="/login" replace />;

  const meta = Object.entries(titleMap).find(([k]) => pathname.startsWith(k))?.[1] ?? {
    title: "Workspace",
    subtitle: "",
  };

  return (
    <div className="flex h-screen w-full bg-transparent">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={meta.title} subtitle={meta.subtitle} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
