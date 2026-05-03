import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "@/store/AppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layers } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/apiClient";

export default function Login() {
  const { login, currentUser, isReady } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (isReady && currentUser) navigate("/dashboard", { replace: true });
  }, [isReady, currentUser, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      if (err instanceof ApiError && Array.isArray(err.details)) {
        const next: { email?: string; password?: string } = {};
        for (const d of err.details as any[]) {
          if (d?.path === "email") next.email = d.message;
          if (d?.path === "password") next.password = d.message;
        }
        setErrors(next);
        const msg = (err.details as any[]).map((d) => d?.message).filter(Boolean).join(" · ") || err.message;
        toast.error(msg);
      } else {
        toast.error(err?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-info/30 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-coral/20 rounded-full blur-3xl" />

      <div className="relative w-full max-w-5xl grid lg:grid-cols-2 glass rounded-lg overflow-hidden shadow-2xl">
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-sidebar via-sidebar to-[hsl(222,40%,17%)] text-sidebar-foreground relative">
          <div className="absolute top-10 right-10 w-40 h-40 bg-primary/30 rounded-full blur-3xl" />
          <Link to="/" className="flex items-center gap-2 relative">
            <div className="w-10 h-10 bg-gradient-mint rounded-xl flex items-center justify-center shadow-lg">
              <Layers className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="text-sidebar-accent-foreground font-bold text-lg">Team Task Manager</div>
          </Link>
          <div className="space-y-4 max-w-md relative">
            <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-white/10 text-white">Trusted by modern teams</div>
            <h2 className="text-3xl font-bold text-sidebar-accent-foreground leading-tight">
              Plan projects, assign work,<br/>and ship on time.
            </h2>
            <p className="text-sm text-sidebar-foreground/80">
              A calm, glassy workspace for product teams. Track tasks, monitor progress, and keep everyone aligned.
            </p>
            <div className="grid grid-cols-3 gap-3 pt-6 text-center">
              {[
                { v: "120+", l: "Projects" },
                { v: "2.4k", l: "Shipped" },
                { v: "98%", l: "On-time" },
              ].map((s) => (
                <div key={s.l} className="border border-white/10 bg-white/5 backdrop-blur p-3 rounded-xl">
                  <div className="text-sidebar-accent-foreground font-bold text-lg">{s.v}</div>
                  <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-[11px] text-sidebar-foreground/50 relative">© 2026 Team Task Manager</div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-10 bg-white/40 backdrop-blur-xl">
          <form onSubmit={submit} className="w-full max-w-sm space-y-5">
            <div>
              <h1 className="text-2xl font-bold">Sign in to Team Task Manager</h1>
              <p className="text-sm text-muted-foreground mt-1">Use your account email and password.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`rounded-xl bg-white/70 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {errors.email && <div className="text-xs text-destructive">{errors.email}</div>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`rounded-xl bg-white/70 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {errors.password && <div className="text-xs text-destructive">{errors.password}</div>}
            </div>

            <Button disabled={loading} type="submit" className="w-full rounded-md h-11 bg-gradient-mint text-primary-foreground hover:opacity-90 shadow-lg font-semibold">
              Sign in
            </Button>

            <div className="text-xs text-muted-foreground text-center">
              New here?{" "}
              <Link to="/signup" className="text-primary font-semibold hover:underline">
                Create an account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
