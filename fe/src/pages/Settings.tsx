import { useApp } from "@/store/AppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoleBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/apiClient";

export default function Settings() {
  const { currentUser, activeProject, updateProfile } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  useEffect(() => {
    setName(currentUser?.name ?? "");
    setEmail(currentUser?.email ?? "");
  }, [currentUser?.name, currentUser?.email]);

  const save = async () => {
    setSaving(true);
    setErrors({});
    try {
      await updateProfile({ name, email });
      toast.success("Profile saved");
    } catch (err: any) {
      if (err instanceof ApiError && Array.isArray(err.details)) {
        const next: { name?: string; email?: string } = {};
        for (const d of err.details as any[]) {
          if (d?.path === "name") next.name = d.message;
          if (d?.path === "email") next.email = d.message;
        }
        setErrors(next);
        const msg = (err.details as any[]).map((d) => d?.message).filter(Boolean).join(" · ") || err.message;
        toast.error(msg);
      } else {
        toast.error(err?.message || "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-5">
      <div className="bg-card border border-border rounded-sm p-6">
        <h2 className="font-semibold mb-1">Profile</h2>
        <p className="text-xs text-muted-foreground mb-5">Update your personal details.</p>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 bg-primary text-primary-foreground rounded-sm flex items-center justify-center font-semibold">
            {(currentUser?.name || "U").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{currentUser?.name}</div>
            <div className="text-xs text-muted-foreground">{currentUser?.email}</div>
            <div className="mt-1"><RoleBadge role={currentUser?.role || "member"} /></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className={`${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`} />
            {errors.name && <div className="text-xs text-destructive">{errors.name}</div>}
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} className={`${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`} />
            {errors.email && <div className="text-xs text-destructive">{errors.email}</div>}
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button disabled={saving} onClick={save} className="rounded-sm">Save changes</Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-sm p-6">
        <h2 className="font-semibold mb-1">Workspace</h2>
        <p className="text-xs text-muted-foreground mb-5">General workspace settings.</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Workspace name</Label><Input defaultValue="Team Task Manager" /></div>
          <div className="space-y-2"><Label>Time zone</Label><Input defaultValue="UTC+05:30" /></div>
        </div>
      </div>

      <div className="bg-card border border-destructive/30 rounded-sm p-6">
        <h2 className="font-semibold mb-1 text-destructive">Sign out everywhere</h2>
        <p className="text-xs text-muted-foreground mb-4">Clears your saved JWT token from this browser.</p>
        <Button
          variant="destructive"
          className="rounded-sm"
          onClick={() => {
            localStorage.removeItem("ttm_token_v1");
            window.location.reload();
          }}
        >
          Clear session
        </Button>
      </div>
    </div>
  );
}
