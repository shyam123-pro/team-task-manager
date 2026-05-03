import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/store/AppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil, Search, Bookmark } from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import type { ApiTask, TaskPriority, TaskStatus } from "@/types/api";
import { ApiError } from "@/lib/apiClient";
import { useSearchParams } from "react-router-dom";

const emptyForm = {
  title: "",
  description: "",
  status: "todo" as TaskStatus,
  priority: "medium" as TaskPriority,
  dueDate: "",
  assigneeId: null as string | null,
};

const UNASSIGNED = "__unassigned__";
const BOOKMARKS_KEY = "ttm_bookmarks_v1";

export default function Tasks() {
  const { currentUser, tasks, projects, activeProjectId, setActiveProjectId, activeProject, createTask, updateTask, updateMyTaskStatus, deleteTask } = useApp();
  const isAdmin = currentUser?.role === "admin";

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ApiTask | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      return true;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const openNew = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      assigneeId: activeProject?.members?.[0]?.user?.id ?? null,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    });
    setOpen(true);
  };

  const openEdit = (t: ApiTask) => {
    setEditing(t);
    setForm({
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      dueDate: new Date(t.dueDate).toISOString().slice(0, 10),
      assigneeId: t.assignee?.id ?? null,
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.title.trim()) return toast.error("Title required");
    if (!form.dueDate) return toast.error("Due date required");
    if (!activeProjectId) return toast.error("Select a project first");

    try {
      if (editing) {
        await updateTask(editing._id, {
          title: form.title,
          description: form.description,
          dueDate: form.dueDate,
          priority: form.priority,
          status: form.status,
          assigneeId: form.assigneeId,
        });
        toast.success("Task updated");
      } else {
        await createTask({
          title: form.title,
          description: form.description,
          dueDate: form.dueDate,
          priority: form.priority,
          assigneeId: form.assigneeId,
        });
        toast.success("Task created");
      }
      setOpen(false);
    } catch (err: any) {
      if (err instanceof ApiError && Array.isArray(err.details)) {
        const parts = (err.details as any[])
          .map((d) => {
            const path = typeof d?.path === "string" && d.path ? d.path : "";
            const msg = typeof d?.message === "string" ? d.message : "";
            if (!path && !msg) return "";
            const label = path ? path.replace(/([A-Z])/g, " $1").replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) : "";
            return label ? `${label}: ${msg}` : msg;
          })
          .filter(Boolean);
        toast.error(parts.join(" • ") || err.message);
      } else {
        toast.error(err?.message || "Failed to save task");
      }
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(BOOKMARKS_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
    } catch {
      return [];
    }
  });

  const isBookmarked = (id: string) => bookmarks.includes(id);
  const toggleBookmark = (id: string) => {
    const removing = isBookmarked(id);
    const next = removing ? bookmarks.filter((x) => x !== id) : [...bookmarks, id];
    setBookmarks(next);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
    toast.success(removing ? "Removed bookmark" : "Bookmarked task");
  };

  return (
    <div className="space-y-4">
      {projects.length === 0 && (
        <div className="text-sm text-muted-foreground">
          No projects yet. Create one in <a className="text-primary font-semibold hover:underline" href="/projects">Projects</a>.
        </div>
      )}
      <div className="bg-card border border-border rounded-sm p-3 flex flex-wrap gap-2 items-center">
        <Select value={activeProjectId ?? ""} onValueChange={(v) => setActiveProjectId(v)}>
          <SelectTrigger className="w-[220px] rounded-sm h-9">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-sm border border-border flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              const v = e.target.value;
              setSearch(v);
              if (v) setSearchParams({ q: v });
              else setSearchParams({});
            }}
            placeholder="Search tasks..."
            className="bg-transparent outline-none text-sm flex-1"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] rounded-sm h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[140px] rounded-sm h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>

        {isAdmin && (
          <Button
            onClick={() => {
              if (!activeProjectId) return toast.error("Select a project first");
              openNew();
            }}
            className="rounded-sm h-9"
          >
            <Plus className="w-4 h-4 mr-1" /> New Task
          </Button>
        )}
      </div>

      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <table className="data-table min-w-[850px]">
          <thead>
            <tr>
              <th>Task</th>
              <th>Assignee</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Due</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const due = new Date(t.dueDate).toISOString().slice(0, 10);
              const overdue = due < today && t.status !== "done";
              return (
                <tr key={t._id} className="hover:bg-muted/40">
                  <td className="font-medium">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={t.status} />
                      <span>{t.title}</span>
                    </div>
                  </td>
                  <td>
                    {t.assignee ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-secondary text-secondary-foreground rounded-sm flex items-center justify-center text-[10px] font-semibold">
                          {t.assignee.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm">{t.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Unassigned</span>
                    )}
                  </td>
                  <td>
                    {isAdmin ? (
                      <Select value={t.status} onValueChange={(v) => updateTask(t._id, { status: v as TaskStatus }).catch((e: any) => toast.error(e?.message || "Update failed"))}>
                        <SelectTrigger className="h-7 rounded-sm w-[130px] text-xs border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select value={t.status} onValueChange={(v) => updateMyTaskStatus(t._id, v as TaskStatus).catch((e: any) => toast.error(e?.message || "Update failed"))}>
                        <SelectTrigger className="h-7 rounded-sm w-[130px] text-xs border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </td>
                  <td><PriorityBadge priority={t.priority} /></td>
                  <td className={overdue ? "text-destructive font-medium tabular-nums" : "tabular-nums"}>{due}</td>
                  <td>
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => toggleBookmark(t._id)}
                        className={`p-1.5 hover:bg-muted rounded-sm ${isBookmarked(t._id) ? "text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
                        aria-label="Bookmark"
                        title={isBookmarked(t._id) ? "Remove bookmark" : "Bookmark"}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked(t._id) ? "fill-current" : ""}`} />
                      </button>
                      {isAdmin && (
                        <>
                          <button onClick={() => openEdit(t)} className="p-1.5 hover:bg-muted rounded-sm text-muted-foreground hover:text-foreground">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              deleteTask(t._id)
                                .then(() => toast.success("Task deleted"))
                                .catch((e: any) => toast.error(e?.message || "Delete failed"))
                            }
                            className="p-1.5 hover:bg-muted rounded-sm text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-sm max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Task" : "New Task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Assignee</Label>
                <Select
                  value={form.assigneeId ?? UNASSIGNED}
                  onValueChange={(v) => setForm({ ...form, assigneeId: v === UNASSIGNED ? null : v })}
                >
                  <SelectTrigger className="rounded-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                    {activeProject?.members?.map((m) => (
                      <SelectItem key={m.user.id} value={m.user.id}>
                        {m.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as TaskPriority })}>
                  <SelectTrigger className="rounded-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as TaskStatus })}>
                  <SelectTrigger className="rounded-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-sm">Cancel</Button>
            <Button onClick={submit} className="rounded-sm">{editing ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
