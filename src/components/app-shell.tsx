import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Users, LogOut, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/leads", label: "Leads", icon: Users, exact: false },
] as const;

export function AppShell({ children, email }: { children: React.ReactNode; email?: string }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[420px] bg-gradient-glow" />
      <div className="relative flex min-h-screen">
        <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur">
          <div className="px-6 py-6 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">Pulse</span>
          </div>
          <nav className="flex-1 px-3 py-2 space-y-1">
            {NAV.map((n) => {
              const active = n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-elegant"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 border-t border-sidebar-border">
            <div className="px-3 py-2 text-xs text-sidebar-foreground/60 truncate">{email}</div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </aside>

        {/* Mobile top bar */}
        <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 h-14 border-b border-border bg-background/85 backdrop-blur">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-gradient-primary grid place-items-center"><Sparkles className="h-3.5 w-3.5 text-primary-foreground" /></div>
            <span className="font-display font-semibold">Pulse</span>
          </div>
          <div className="flex items-center gap-1">
            {NAV.map((n) => {
              const active = n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to);
              return (
                <Link key={n.to} to={n.to} className={cn("p-2 rounded-md", active ? "text-primary" : "text-muted-foreground")}>
                  <n.icon className="h-5 w-5" />
                </Link>
              );
            })}
            <button onClick={handleLogout} className="p-2 text-muted-foreground"><LogOut className="h-5 w-5" /></button>
          </div>
        </div>

        <main className="flex-1 min-w-0 pt-14 md:pt-0">{children}</main>
      </div>
    </div>
  );
}
