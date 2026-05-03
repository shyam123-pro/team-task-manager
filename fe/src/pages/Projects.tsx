import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/store/AppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Users as UsersIcon, Calendar, Check, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProjectRole } from "@/types/api";
import { apiFetch } from "@/lib/apiClient";
import { useSearchParams } from "react-router-dom";

export default function Projects() {
  const { currentUser, projects, activeProjectId, setActiveProjectId, activeProject, createProject, updateProjectName, deleteProject, addProjectMember, removeProjectMember } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<ProjectRole>("member");
  const isAdmin = currentUser?.role === "admin";
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [allUsers, setAllUsers] = useState<Array<{ id: string; name: string; email: string; role: "admin" | "member" }>>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  useEffect(() => {
    if (!isAdmin) return;
    apiFetch<{ users: Array<{ id: string; name: string; email: string; role: "admin" | "member" }> }>("/admin/users")
      .then((r) => setAllUsers(r.users))
      .catch(() => setAllUsers([]));
  }, [isAdmin]);

  const usersForPicker = useMemo(() => allUsers, [allUsers]);

  const submit = async () => {
    if (!name.trim()) return toast.error("Project name is required");
    try {
      await createProject(name.trim());
      toast.success("Project created");
      setName("");
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create project");
    }
  };

  const visibleProjects = useMemo(() => {
    if (!q) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(q));
  }, [projects, q]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{projects.length} project{projects.length === 1 ? "" : "s"}</div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-sm"><Plus className="w-4 h-4 mr-1" /> New Project</Button>
            </DialogTrigger>
            <DialogContent className="rounded-sm">
              <DialogHeader><DialogTitle>Create project</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Q3 Launch" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} className="rounded-sm">Cancel</Button>
                <Button onClick={submit} className="rounded-sm">Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="bg-card border border-border rounded-sm p-3 flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          value={searchParams.get("q") || ""}
          onChange={(e) => {
            const v = e.target.value;
            if (v) setSearchParams({ q: v });
            else setSearchParams({});
          }}
          placeholder="Search projects..."
          className="rounded-sm h-9 max-w-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visibleProjects.map((p) => {
          const isActive = activeProjectId === p.id;
          return (
            <div
              key={p.id}
              onClick={async () => {
                setActiveProjectId(p.id);
              }}
              className={`bg-card border rounded-sm p-5 flex flex-col cursor-pointer transition ${isActive ? "border-primary shadow-md shadow-primary/10" : "border-border hover:border-border/80"}`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{p.name}</h3>
                <div className="flex items-center gap-2">
                  {isActive && <Check className="w-4 h-4 text-primary" />}
                  {isActive && isAdmin && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditName(p.name);
                          setEditOpen(true);
                        }}
                        className="p-1.5 hover:bg-muted rounded-sm text-muted-foreground hover:text-foreground"
                        aria-label="Edit project"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!confirm(`Delete project \"${p.name}\"? This will delete all tasks.`)) return;
                          deleteProject(p.id)
                            .then(() => toast.success("Project deleted"))
                            .catch((err: any) => toast.error(err?.message || "Delete failed"));
                        }}
                        className="p-1.5 hover:bg-muted rounded-sm text-muted-foreground hover:text-destructive"
                        aria-label="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(p.createdAt).toISOString().slice(0, 10)}</span>
                <span className="uppercase tracking-wider font-semibold">{p.role}</span>
              </div>

              <div className="border-t border-border pt-3 mt-auto">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <UsersIcon className="w-3 h-3" /> Members ({p.membersCount ?? "—"})
                  </div>
                </div>
                {isActive && isAdmin && (
                  <details className="text-xs" onClick={(e) => e.stopPropagation()}>
                    <summary className="cursor-pointer text-primary hover:underline">Manage members</summary>
                    <div className="mt-3 space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <Select value={selectedUserId} onValueChange={(v) => setSelectedUserId(v)}>
                          <SelectTrigger className="rounded-sm col-span-2 h-9">
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                          <SelectContent>
                            {usersForPicker.map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.name} ({u.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={memberRole} onValueChange={(v) => setMemberRole(v as ProjectRole)}>
                          <SelectTrigger className="rounded-sm h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">member</SelectItem>
                            <SelectItem value="admin">admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <Input value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} placeholder="Or type email manually" className="rounded-sm h-9" />
                      </div>
                      <Button
                        className="rounded-sm h-9 w-full"
                        onClick={async () => {
                          const emailFromSelect = selectedUserId ? usersForPicker.find((u) => u.id === selectedUserId)?.email : "";
                          const email = (emailFromSelect || memberEmail).trim();
                          if (!email) return toast.error("Email required");
                          try {
                            await addProjectMember(email, memberRole);
                            toast.success("Member added");
                            setMemberEmail("");
                            setSelectedUserId("");
                          } catch (err: any) {
                            toast.error(err?.message || "Failed to add member");
                          }
                        }}
                      >
                        Add member
                      </Button>
                      <div className="border-t border-border/60 pt-3 space-y-1">
                        {activeProject?.members.map((m) => (
                          <div key={m.user.id} className="flex items-center justify-between gap-2 px-2 py-1.5 hover:bg-muted rounded-sm">
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">{m.user.name}</div>
                              <div className="text-[11px] text-muted-foreground truncate">{m.user.email}</div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{m.role}</span>
                              {m.role !== "admin" && (
                                <button
                                  className="text-[11px] text-destructive hover:underline"
                                  onClick={async () => {
                                    try {
                                      await removeProjectMember(m.user.id);
                                      toast.success("Member removed");
                                    } catch (err: any) {
                                      toast.error(err?.message || "Failed to remove member");
                                    }
                                  }}
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </details>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-sm">
          <DialogHeader><DialogTitle>Edit project</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-sm" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button
              className="rounded-sm"
              onClick={() => {
                if (!activeProjectId) return;
                if (!editName.trim()) return toast.error("Name required");
                updateProjectName(activeProjectId, editName.trim())
                  .then(() => {
                    toast.success("Project updated");
                    setEditOpen(false);
                  })
                  .catch((err: any) => toast.error(err?.message || "Update failed"));
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
