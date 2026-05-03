import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "@/store/AppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layers } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/apiClient";

export default function Signup() {
  const { signup, currentUser, isReady } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  useEffect(() => {
    if (isReady && currentUser) navigate("/dashboard", { replace: true });
  }, [isReady, currentUser, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await signup(name, email, password);
      navigate("/dashboard");
    } catch (err: any) {
      if (err instanceof ApiError && Array.isArray(err.details)) {
        const next: { name?: string; email?: string; password?: string } = {};
        for (const d of err.details as any[]) {
          if (d?.path === "name") next.name = d.message;
          if (d?.path === "email") next.email = d.message;
          if (d?.path === "password") next.password = d.message;
        }
        setErrors(next);
        const msg = (err.details as any[]).map((d) => d?.message).filter(Boolean).join(" · ") || err.message;
        toast.error(msg);
      } else {
        toast.error(err?.message || "Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-info/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-primary/30 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md glass rounded-lg p-8 shadow-2xl">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-gradient-mint rounded-xl flex items-center justify-center shadow-lg">
            <Layers className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="font-bold text-lg">Team Task Manager</div>
        </Link>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-sm text-muted-foreground mt-1">Start managing tasks in seconds.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={`rounded-xl bg-white/70 ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.name && <div className="text-xs text-destructive">{errors.name}</div>}
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
              minLength={6}
              className={`rounded-xl bg-white/70 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.password && <div className="text-xs text-destructive">{errors.password}</div>}
          </div>

          <Button disabled={loading} type="submit" className="w-full rounded-md h-11 bg-gradient-mint text-primary-foreground hover:opacity-90 shadow-lg font-semibold">
            Create account
          </Button>

          <div className="text-xs text-muted-foreground text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
