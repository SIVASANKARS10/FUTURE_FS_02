import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ArrowRight, Sparkles, BarChart3, Users, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pulse CRM — Lead management, beautifully simple" },
      { name: "description", content: "A premium minimal CRM to capture, organize and convert leads. Built for startups and modern agencies." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && user) navigate({ to: "/app" });
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-gradient-glow" />
      <header className="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-semibold">Pulse</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
          <Link to="/login" search={{ mode: "signup" }} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow transition-all">
            Get started
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-32">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Built for modern teams
          </div>
          <h1 className="mt-6 font-display text-5xl md:text-7xl font-semibold tracking-tight text-balance">
            Lead management,<br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">beautifully simple.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl text-balance">
            Capture leads, track conversations, and close deals — all from a workspace that feels as fast as it looks.
          </p>
          <div className="mt-10 flex items-center gap-3">
            <Link to="/login" search={{ mode: "signup" }} className="group inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-3 text-sm font-medium shadow-glow hover:bg-primary/90 transition-all">
              Start for free <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/login" className="rounded-lg border border-border bg-card/60 px-5 py-3 text-sm font-medium hover:bg-card transition-colors">
              I have an account
            </Link>
          </div>
        </div>

        <div className="mt-24 grid sm:grid-cols-3 gap-4">
          {[
            { icon: Users, title: "Unified inbox", desc: "All your leads from every source — in one elegant table." },
            { icon: BarChart3, title: "Live insights", desc: "Pipeline health, status splits, and conversion at a glance." },
            { icon: Zap, title: "Fast as thought", desc: "Built with keyboard-first interactions and instant feedback." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-gradient-surface p-6 shadow-elegant">
              <f.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
