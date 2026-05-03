import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Analytics01Icon, CalendarCheckIn01Icon, KanbanIcon, Shield01Icon, UserGroupIcon, ZapIcon } from "@hugeicons/core-free-icons";
import { Layers, CheckCircle2, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b border-white/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-mint rounded-md flex items-center justify-center shadow-md">
              <Layers className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Team Task Manager</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#roles" className="hover:text-foreground">Roles</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" className="rounded-md">Sign in</Button></Link>
            <Link to="/signup"><Button className="rounded-md bg-gradient-mint text-primary-foreground hover:opacity-90 shadow-md">Get started</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-24">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute top-20 -right-10 w-96 h-96 rounded-full bg-info/20 blur-3xl" />
        <div className="relative text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-medium mb-6">New · Role-based dashboards for Admins & Members</div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05]">
            Where teams turn <span className="gradient-text">ideas into shipped work</span>.
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Team Task Manager is the calm, glassy workspace for managing projects, assigning tasks and tracking progress — built for modern product teams.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/signup">
              <Button size="lg" className="rounded-md bg-gradient-mint text-primary-foreground hover:opacity-90 shadow-lg h-12 px-7 text-base">
                Start for free <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="rounded-md h-12 px-7 text-base bg-white/60 backdrop-blur">
                I already have an account
              </Button>
            </Link>
          </div>
        </div>

        {/* Mock dashboard preview */}
        <div className="relative mt-16 max-w-5xl mx-auto">
          <div className="glass rounded-lg p-3 sm:p-4 shadow-2xl">
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-3 hidden md:block bg-sidebar text-sidebar-foreground rounded-md p-4 space-y-2">
                <div className="text-xs uppercase tracking-wider text-sidebar-foreground/60">Workspace</div>
                {["Dashboard", "Projects", "Tasks", "Team"].map((x, i) => (
                  <div key={x} className={`px-3 py-2 rounded-lg text-sm ${i===0?"bg-primary/20 text-primary":""}`}>{x}</div>
                ))}
              </div>
              <div className="col-span-12 md:col-span-9 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { l: "Tasks", v: "248", c: "bg-primary/15 text-primary" },
                    { l: "In Progress", v: "42", c: "bg-info/15 text-info" },
                    { l: "Done", v: "186", c: "bg-coral/15 text-coral" },
                  ].map((s) => (
                    <div key={s.l} className="bg-white/80 rounded-md p-4">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
                      <div className="text-2xl font-bold mt-1">{s.v}</div>
                      <div className={`mt-2 h-1.5 rounded-full ${s.c}`} />
                    </div>
                  ))}
                </div>
                <div className="bg-white/80 rounded-md p-4 h-40 flex items-end gap-2">
                  {[40,65,30,80,55,90,72,48,68,85,60,40].map((h,i)=>(
                    <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-primary to-info" style={{height:`${h}%`}}/>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-4xl font-bold">Everything your team needs</h2>
          <p className="mt-3 text-muted-foreground">From kanban boards to overdue tracking — all in one calm interface.</p>
        </div>
	        <div className="grid md:grid-cols-3 gap-5">
	          {[
	            { i: KanbanIcon, c: "bg-primary/15 text-primary", t: "Kanban-ready tasks", d: "Track every task by status with inline updates and drag-friendly views." },
	            { i: UserGroupIcon, c: "bg-info/15 text-info", t: "Team workspaces", d: "Invite members, assign work, and see workloads at a glance." },
	            { i: Analytics01Icon, c: "bg-coral/15 text-coral", t: "Insightful dashboards", d: "Separate views for Admins and Members with the metrics each role needs." },
	            { i: Shield01Icon, c: "bg-violet/15 text-violet", t: "Role-based access", d: "Admins manage everything. Members focus on their own work." },
	            { i: ZapIcon, c: "bg-warning/15 text-warning", t: "Lightning fast", d: "Built on a modern stack with instant navigation and updates." },
	            { i: CalendarCheckIn01Icon, c: "bg-teal/15 text-teal", t: "Overdue tracking", d: "Never miss a deadline with automatic overdue surfacing." },
	          ].map((f) => (
	            <div key={f.t} className="glass rounded-md p-6 hover:-translate-y-1 transition-transform">
	              <div className={`w-11 h-11 rounded-md flex items-center justify-center ${f.c}`}>
	                <HugeiconsIcon icon={f.i} size={20} color="currentColor" strokeWidth={1.8} />
	              </div>
	              <h3 className="mt-4 font-semibold text-lg">{f.t}</h3>
	              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
	            </div>
	          ))}
	        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass rounded-lg p-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/30 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-primary/15 text-primary">ADMIN</div>
              <h3 className="mt-4 text-2xl font-bold">Run the whole workspace</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5"/>Create & delete projects</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5"/>Assign tasks to any member</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5"/>Manage team & roles</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5"/>View workspace analytics</li>
              </ul>
            </div>
          </div>
          <div className="glass rounded-lg p-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-info/30 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-info/15 text-info">MEMBER</div>
              <h3 className="mt-4 text-2xl font-bold">Stay focused on your work</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-info mt-0.5"/>See only your assigned tasks</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-info mt-0.5"/>Update status & progress</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-info mt-0.5"/>Personal dashboard & deadlines</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-info mt-0.5"/>Collaborate with teammates</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <div className="rounded-lg bg-gradient-mint p-10 sm:p-14 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)] opacity-30" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-foreground">Ready to get organized?</h2>
            <p className="mt-3 text-primary-foreground/80">Free during beta. No credit card. Just clarity.</p>
            <Link to="/signup">
              <Button size="lg" className="mt-6 rounded-md bg-foreground text-background hover:bg-foreground/90 h-12 px-8">
                Create your workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-8 text-center text-xs text-muted-foreground">
        © 2026 Team Task Manager. Crafted for modern teams.
      </footer>
    </div>
  );
}
