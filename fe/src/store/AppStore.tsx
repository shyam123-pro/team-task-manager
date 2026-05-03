import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { apiFetch, setToken } from "@/lib/apiClient";
import type { ApiProjectDetail, ApiProjectListItem, ApiTask, ApiUser, DashboardResponse, ProjectRole, TaskPriority, TaskStatus, ApiNotification, NotificationsResponse } from "@/types/api";

interface AuthUser extends ApiUser {}

interface AppState {
  currentUser: AuthUser | null;
  token: string | null;
  projects: ApiProjectListItem[];
  activeProjectId: string | null;
  activeProject: ApiProjectDetail | null;
  tasks: ApiTask[];
  dashboard: DashboardResponse | null;
  notifications: ApiNotification[];
  unreadNotifications: number;
  isReady: boolean;

  setActiveProjectId: (id: string) => void;
  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;

  refreshAll: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  refreshActiveProject: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  refreshNotifications: (opts?: { unreadOnly?: boolean }) => Promise<void>;

  updateProfile: (input: { name?: string; email?: string }) => Promise<void>;

  createProject: (name: string) => Promise<void>;
  updateProjectName: (projectId: string, name: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  addProjectMember: (email: string, role: ProjectRole) => Promise<void>;
  removeProjectMember: (userId: string) => Promise<void>;

  createTask: (input: { title: string; description?: string; dueDate: string; priority: TaskPriority; assigneeId?: string | null }) => Promise<void>;
  updateTask: (taskId: string, input: Partial<{ title: string; description: string; dueDate: string; priority: TaskPriority; status: TaskStatus; assigneeId: string | null }>) => Promise<void>;
  updateMyTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

const LS_ACTIVE_PROJECT = "ttm_active_project_v1";

export function AppProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [token, setTokenState] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [projects, setProjects] = useState<ApiProjectListItem[]>([]);
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<ApiProjectDetail | null>(null);
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    // bootstrap active project selection
    try {
      const saved = localStorage.getItem(LS_ACTIVE_PROJECT);
      if (saved) setActiveProjectIdState(saved);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (activeProjectId) localStorage.setItem(LS_ACTIVE_PROJECT, activeProjectId);
    } catch {
      // ignore
    }
  }, [activeProjectId]);

  const setActiveProjectId = (id: string) => {
    setActiveProjectIdState(id);
  };

  const refreshProjects = async () => {
    const res = await apiFetch<{ projects: ApiProjectListItem[] }>("/projects");
    setProjects(res.projects);
    const first = res.projects[0]?.id ?? null;
    const exists = activeProjectId && res.projects.some((p) => p.id === activeProjectId);
    if ((!activeProjectId || !exists) && first) setActiveProjectIdState(first);
  };

  const refreshActiveProject = async () => {
    if (!activeProjectId) {
      setActiveProject(null);
      return;
    }
    const res = await apiFetch<{ project: ApiProjectDetail }>(`/projects/${activeProjectId}`);
    setActiveProject(res.project);
  };

  const refreshTasks = async () => {
    if (!activeProjectId) {
      setTasks([]);
      return;
    }
    const res = await apiFetch<{ tasks: ApiTask[] }>(`/tasks/project/${activeProjectId}`);
    setTasks(res.tasks);
  };

  const refreshDashboard = async () => {
    const res = await apiFetch<DashboardResponse>("/dashboard");
    setDashboard(res);
  };

  const refreshNotifications = async (opts?: { unreadOnly?: boolean }) => {
    const params = new URLSearchParams();
    if (opts?.unreadOnly) params.set("unreadOnly", "true");
    const res = await apiFetch<NotificationsResponse>(`/notifications${params.toString() ? `?${params.toString()}` : ""}`);
    setNotifications(res.notifications);
    setUnreadNotifications(res.unreadCount);
  };

  const refreshAll = async () => {
    await apiFetch<{ user: ApiUser }>("/auth/me").then((r) => setCurrentUser(r.user));
    await refreshProjects();
    await refreshDashboard();
    await refreshNotifications();
  };

  useEffect(() => {
    (async () => {
      try {
        const existing = localStorage.getItem("ttm_token_v1");
        if (existing) {
          setTokenState(existing);
          await refreshAll();
        }
      } finally {
        setIsReady(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!token) return;
    const id = window.setInterval(() => {
      refreshNotifications().catch(() => {});
    }, 15000);
    const onFocus = () => refreshNotifications().catch(() => {});
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!token) return;
    refreshActiveProject().then(() => refreshTasks()).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProjectId, token]);

  const signup = async (name: string, email: string, password: string) => {
    const res = await apiFetch<{ token: string; user: ApiUser }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    setToken(res.token);
    setTokenState(res.token);
    setCurrentUser(res.user);
    await refreshProjects();
    await refreshDashboard();
    await refreshNotifications();
  };

  const login = async (email: string, password: string) => {
    const res = await apiFetch<{ token: string; user: ApiUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(res.token);
    setTokenState(res.token);
    setCurrentUser(res.user);
    await refreshProjects();
    await refreshDashboard();
    await refreshNotifications();
  };

  const logout = () => {
    setToken(null);
    setTokenState(null);
    setCurrentUser(null);
    setProjects([]);
    setActiveProject(null);
    setTasks([]);
    setDashboard(null);
    setNotifications([]);
    setUnreadNotifications(0);
  };

  const updateProfile = async (input: { name?: string; email?: string }) => {
    const res = await apiFetch<{ user: ApiUser }>("/auth/me", { method: "PATCH", body: JSON.stringify(input) });
    setCurrentUser(res.user);
  };

  const createProject = async (name: string) => {
    await apiFetch("/projects", { method: "POST", body: JSON.stringify({ name }) });
    await refreshProjects();
  };

  const updateProjectName = async (projectId: string, name: string) => {
    await apiFetch(`/projects/${projectId}`, { method: "PATCH", body: JSON.stringify({ name }) });
    await refreshProjects();
    if (activeProjectId === projectId) await refreshActiveProject();
  };

  const deleteProject = async (projectId: string) => {
    await apiFetch(`/projects/${projectId}`, { method: "DELETE" });
    if (activeProjectId === projectId) setActiveProjectIdState(null);
    await refreshProjects();
    await refreshDashboard();
    await refreshNotifications();
  };

  const addProjectMember = async (email: string, role: ProjectRole) => {
    if (!activeProjectId) return;
    await apiFetch(`/projects/${activeProjectId}/members`, { method: "POST", body: JSON.stringify({ email, role }) });
    await refreshActiveProject();
  };

  const removeProjectMember = async (userId: string) => {
    if (!activeProjectId) return;
    await apiFetch(`/projects/${activeProjectId}/members/${userId}`, { method: "DELETE" });
    await refreshActiveProject();
  };

  const createTask = async (input: { title: string; description?: string; dueDate: string; priority: TaskPriority; assigneeId?: string | null }) => {
    if (!activeProjectId) throw new Error("No active project");
    await apiFetch(`/tasks/project/${activeProjectId}`, { method: "POST", body: JSON.stringify(input) });
    await refreshTasks();
    await refreshDashboard();
  };

  const updateTask = async (taskId: string, input: Partial<{ title: string; description: string; dueDate: string; priority: TaskPriority; status: TaskStatus; assigneeId: string | null }>) => {
    await apiFetch(`/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify(input) });
    await refreshTasks();
    await refreshDashboard();
  };

  const updateMyTaskStatus = async (taskId: string, status: TaskStatus) => {
    await apiFetch(`/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify({ status }) });
    await refreshTasks();
    await refreshDashboard();
  };

  const deleteTask = async (taskId: string) => {
    await apiFetch(`/tasks/${taskId}`, { method: "DELETE" });
    await refreshTasks();
    await refreshDashboard();
  };

  const value = useMemo<AppState>(
    () => ({
      currentUser,
      token,
      projects,
      activeProjectId,
      activeProject,
      tasks,
      dashboard,
      notifications,
      unreadNotifications,
      isReady,
      setActiveProjectId,
      signup,
      login,
      logout,
      refreshAll,
      refreshProjects,
      refreshActiveProject,
      refreshTasks,
      refreshDashboard,
      refreshNotifications,
      updateProfile,
      createProject,
      updateProjectName,
      deleteProject,
      addProjectMember,
      removeProjectMember,
      createTask,
      updateTask,
      updateMyTaskStatus,
      deleteTask,
    }),
    [currentUser, token, projects, activeProjectId, activeProject, tasks, dashboard, isReady]
  );

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
