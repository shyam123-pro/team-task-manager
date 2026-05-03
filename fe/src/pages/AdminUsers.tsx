import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/store/AppStore";
import { apiFetch, ApiError } from "@/lib/apiClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoleBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Pencil } from "lucide-react";

type AdminUser = { id: string; name: string; email: string; role: "admin" | "member" };

export default function AdminUsers() {
  const { currentUser } = useApp();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ users: AdminUser[] }>(`/admin/users${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
      setItems(res.users);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canEdit = currentUser?.role === "admin";

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((u) => u.email.toLowerCase().includes(s) || u.name.toLowerCase().includes(s));
  }, [items, q]);

  const updateUser = async (id: string, patch: Partial<AdminUser>) => {
    try {
      const res = await apiFetch<{ user: AdminUser }>(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
      setItems((prev) => prev.map((x) => (x.id === id ? res.user : x)));
      toast.success("User updated");
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 409) toast.error("Email already in use");
      else toast.error(e?.message || "Update failed");
    }
  };

  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "member">("member");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const openEdit = (u: AdminUser) => {
    setEditUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditOpen(true);
  };

  const openDelete = (u: AdminUser) => {
    setDeleteUserId(u.id);
    setDeleteOpen(true);
  };

  const doDelete = async () => {
    if (!deleteUserId) return;
    try {
      await apiFetch(`/admin/users/${deleteUserId}`, { method: "DELETE" });
      setItems((prev) => prev.filter((x) => x.id !== deleteUserId));
      toast.success("User deleted");
      setDeleteOpen(false);
      setDeleteUserId(null);
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-sm p-4 flex items-end gap-3 flex-wrap">
        <div className="space-y-2">
          <Label>Search</Label>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email" className="rounded-sm w-72" />
        </div>
        <Button onClick={fetchUsers} disabled={loading} className="rounded-sm h-9">
          Refresh
        </Button>
      </div>

      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <table className="data-table min-w-[800px]">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td className="font-medium">{u.name}</td>
                <td className="text-muted-foreground">{u.email}</td>
                <td>
                  {canEdit ? (
                    <Select value={u.role} onValueChange={(v) => updateUser(u.id, { role: v as any })}>
                      <SelectTrigger className="h-8 w-[140px] rounded-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">member</SelectItem>
                        <SelectItem value="admin">admin</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <RoleBadge role={u.role} />
                  )}
                </td>
                <td className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      className="rounded-sm h-8"
                      disabled={!canEdit}
                      onClick={() => openEdit(u)}
                    >
                      <Pencil className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      className="rounded-sm h-8"
                      disabled={!canEdit || u.id === currentUser?.id}
                      onClick={() => openDelete(u)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-sm text-muted-foreground py-10">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-sm">
          <DialogHeader><DialogTitle>Edit user</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="rounded-sm" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="rounded-sm" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as any)}>
                <SelectTrigger className="rounded-sm h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">member</SelectItem>
                  <SelectItem value="admin">admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-sm" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button
              className="rounded-sm"
              onClick={async () => {
                if (!editUser) return;
                try {
                  const res = await apiFetch<{ user: AdminUser }>(`/admin/users/${editUser.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({ name: editName, email: editEmail, role: editRole }),
                  });
                  setItems((prev) => prev.map((x) => (x.id === editUser.id ? res.user : x)));
                  toast.success("User updated");
                  setEditOpen(false);
                } catch (e: any) {
                  if (e instanceof ApiError && e.status === 409) toast.error("Email already in use");
                  else toast.error(e?.message || "Update failed");
                }
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="rounded-sm">
          <DialogHeader><DialogTitle>Delete user?</DialogTitle></DialogHeader>
          <div className="text-sm text-muted-foreground">
            This will remove the user from all projects and unassign their tasks. This cannot be undone.
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-sm" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" className="rounded-sm" onClick={doDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
