import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Lead, LeadStatus, LeadSource } from "@/lib/leads";
import { STATUS_META, SOURCE_LABELS, exportLeadsCsv } from "@/lib/leads";
import { Search, Plus, Download, Inbox } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { LeadDetailPanel } from "@/components/lead-detail-panel";
import { AddLeadModal } from "@/components/add-lead-modal";

export const Route = createFileRoute("/app/leads")({
  head: () => ({ meta: [{ title: "Leads — Pulse CRM" }] }),
  component: LeadsPage,
});

function LeadsPage() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "all">("all");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    supabase.from("leads").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setLeads((data as Lead[]) ?? []);
    });
  }, []);

  const filtered = useMemo(() => {
    if (!leads) return null;
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
      if (q && !(l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [leads, search, statusFilter, sourceFilter]);

  const updateLead = (l: Lead) => {
    setLeads((curr) => curr?.map((x) => (x.id === l.id ? l : x)) ?? null);
    setSelected(l);
  };
  const removeLead = (id: string) => {
    setLeads((curr) => curr?.filter((x) => x.id !== id) ?? null);
    setSelected(null);
  };

  const inlineStatus = async (lead: Lead, status: LeadStatus) => {
    const { data } = await supabase.from("leads").update({ status }).eq("id", lead.id).select().single();
    if (data) updateLead(data as Lead);
  };

  return (
    <div className="px-6 md:px-10 py-8 md:py-10 max-w-7xl mx-auto">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Leads</h1>
          <p className="mt-1 text-sm text-muted-foreground">{leads?.length ?? 0} total · {filtered?.length ?? 0} shown</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => leads && exportLeadsCsv(leads)} disabled={!leads?.length}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3.5 py-2 text-sm hover:bg-card disabled:opacity-50 transition-colors">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-3.5 py-2 text-sm font-medium shadow-glow hover:bg-primary/90 transition-all">
            <Plus className="h-4 w-4" /> Add lead
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…"
            className="w-full rounded-lg bg-card border border-border pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "all")}
          className="rounded-lg bg-card border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="all">All statuses</option>
          {(Object.keys(STATUS_META) as LeadStatus[]).map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
        </select>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as LeadSource | "all")}
          className="rounded-lg bg-card border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="all">All sources</option>
          {(Object.keys(SOURCE_LABELS) as LeadSource[]).map((s) => <option key={s} value={s}>{SOURCE_LABELS[s]}</option>)}
        </select>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card shadow-elegant overflow-hidden">
        {leads === null ? (
          <div className="p-3 space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 rounded-lg bg-muted/40 animate-pulse" />)}</div>
        ) : filtered && filtered.length === 0 ? (
          <EmptyState hasLeads={leads.length > 0} onAdd={() => setShowAdd(true)} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium hidden md:table-cell">Email</th>
                  <th className="px-5 py-3 font-medium hidden lg:table-cell">Phone</th>
                  <th className="px-5 py-3 font-medium">Source</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium hidden md:table-cell">Added</th>
                </tr>
              </thead>
              <tbody>
                {filtered!.map((l) => {
                  const meta = STATUS_META[l.status];
                  const initials = l.name.split(" ").map((n) => n[0]).slice(0, 2).join("");
                  return (
                    <tr key={l.id} onClick={() => setSelected(l)}
                      className="border-b border-border/50 last:border-0 hover:bg-accent/40 cursor-pointer transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground text-xs font-semibold shrink-0">{initials}</div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{l.name}</div>
                            <div className="text-xs text-muted-foreground md:hidden truncate">{l.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell text-muted-foreground">{l.email}</td>
                      <td className="px-5 py-3.5 hidden lg:table-cell text-muted-foreground">{l.phone ?? "—"}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{SOURCE_LABELS[l.source]}</td>
                      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <select value={l.status} onChange={(e) => inlineStatus(l, e.target.value as LeadStatus)}
                          className={`appearance-none rounded-full border px-2.5 py-1 text-xs font-medium cursor-pointer ${meta.classes}`}>
                          {(Object.keys(STATUS_META) as LeadStatus[]).map((s) => <option key={s} value={s} className="bg-popover text-foreground">{STATUS_META[s].label}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell text-muted-foreground text-xs">{formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && <LeadDetailPanel lead={selected} onClose={() => setSelected(null)} onUpdate={updateLead} onDelete={removeLead} />}
      {showAdd && <AddLeadModal onClose={() => setShowAdd(false)} onCreated={(l) => { setLeads((c) => [l, ...(c ?? [])]); setShowAdd(false); }} />}
    </div>
  );
}

function EmptyState({ hasLeads, onAdd }: { hasLeads: boolean; onAdd: () => void }) {
  return (
    <div className="py-20 px-6 text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-surface border border-border grid place-items-center shadow-elegant">
        <Inbox className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-5 font-display text-lg font-semibold">{hasLeads ? "No matches" : "No leads yet"}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{hasLeads ? "Try adjusting your search or filters." : "Add your first lead to get started."}</p>
      {!hasLeads && (
        <button onClick={onAdd} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow-glow hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add lead
        </button>
      )}
    </div>
  );
}
