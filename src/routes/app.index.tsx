import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Lead } from "@/lib/leads";
import { STATUS_META } from "@/lib/leads";
import { Users, UserPlus, MessageSquare, CheckCircle2, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Dashboard — Pulse CRM" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [leads, setLeads] = useState<Lead[] | null>(null);

  useEffect(() => {
    supabase.from("leads").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setLeads((data as Lead[]) ?? []);
    });
  }, []);

  const total = leads?.length ?? 0;
  const newCount = leads?.filter((l) => l.status === "new").length ?? 0;
  const contacted = leads?.filter((l) => l.status === "contacted").length ?? 0;
  const converted = leads?.filter((l) => l.status === "converted").length ?? 0;
  const conversionRate = total ? Math.round((converted / total) * 100) : 0;

  const sourceData = leads
    ? Object.entries(
        leads.reduce<Record<string, number>>((acc, l) => ({ ...acc, [l.source]: (acc[l.source] ?? 0) + 1 }), {})
      ).map(([source, count]) => ({ source, count }))
    : [];

  const recent = leads?.slice(0, 5) ?? [];

  const cards = [
    { label: "Total Leads", value: total, icon: Users, hint: "All time" },
    { label: "New", value: newCount, icon: UserPlus, hint: "Awaiting outreach" },
    { label: "Contacted", value: contacted, icon: MessageSquare, hint: "In conversation" },
    { label: "Converted", value: converted, icon: CheckCircle2, hint: `${conversionRate}% conversion` },
  ];

  return (
    <div className="px-6 md:px-10 py-8 md:py-10 max-w-7xl mx-auto">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">A quick pulse on your pipeline.</p>
        </div>
        {total > 0 && (
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs">
            <TrendingUp className="h-3.5 w-3.5 text-success" />
            <span className="text-muted-foreground">Conversion rate</span>
            <span className="font-medium text-foreground">{conversionRate}%</span>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-elegant">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{c.label}</span>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-3 font-display text-3xl font-semibold tracking-tight">
              {leads === null ? <span className="inline-block h-8 w-12 rounded bg-muted animate-pulse" /> : c.value}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{c.hint}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-elegant">
          <h2 className="font-display text-lg font-semibold">Leads by source</h2>
          <p className="text-xs text-muted-foreground">Where your pipeline comes from.</p>
          <div className="mt-4 h-64">
            {leads === null ? (
              <div className="h-full rounded-lg bg-muted/40 animate-pulse" />
            ) : sourceData.length === 0 ? (
              <div className="h-full grid place-items-center text-sm text-muted-foreground">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <XAxis dataKey="source" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: "var(--accent)", opacity: 0.4 }}
                    contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {sourceData.map((_, i) => (
                      <Cell key={i} fill={`var(--chart-${(i % 5) + 1})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
          <h2 className="font-display text-lg font-semibold">Recent leads</h2>
          <p className="text-xs text-muted-foreground">Latest additions to your pipeline.</p>
          <div className="mt-4 space-y-3">
            {leads === null ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 rounded-lg bg-muted/40 animate-pulse" />)
            ) : recent.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">No leads yet</div>
            ) : (
              recent.map((l) => {
                const meta = STATUS_META[l.status];
                return (
                  <div key={l.id} className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground text-xs font-semibold shrink-0">
                      {l.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{l.name}</div>
                      <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}</div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs ${meta.classes}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />{meta.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
