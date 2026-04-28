import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Lead, LeadNote, LeadStatus, LeadSource } from "@/lib/leads";
import { STATUS_META, SOURCE_LABELS } from "@/lib/leads";
import { X, Mail, Phone, Calendar, Trash2, Send, Loader2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

interface Props {
  lead: Lead | null;
  onClose: () => void;
  onUpdate: (lead: Lead) => void;
  onDelete: (id: string) => void;
}

export function LeadDetailPanel({ lead, onClose, onUpdate, onDelete }: Props) {
  const [notes, setNotes] = useState<LeadNote[] | null>(null);
  const [newNote, setNewNote] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!lead) { setNotes(null); return; }
    setNotes(null);
    supabase.from("lead_notes").select("*").eq("lead_id", lead.id).order("created_at", { ascending: false }).then(({ data }) => {
      setNotes((data as LeadNote[]) ?? []);
    });
  }, [lead]);

  if (!lead) return null;
  const meta = STATUS_META[lead.status];
  const initials = lead.name.split(" ").map((n) => n[0]).slice(0, 2).join("");

  const handleStatus = async (status: LeadStatus) => {
    const { data, error } = await supabase.from("leads").update({ status }).eq("id", lead.id).select().single();
    if (error) return toast.error("Couldn't update status");
    onUpdate(data as Lead);
    toast.success(`Marked as ${STATUS_META[status].label}`);
  };

  const handleSource = async (source: LeadSource) => {
    const { data, error } = await supabase.from("leads").update({ source }).eq("id", lead.id).select().single();
    if (error) return toast.error("Couldn't update source");
    onUpdate(data as Lead);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setPosting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from("lead_notes").insert({
      lead_id: lead.id, user_id: user.id, content: newNote.trim(),
    }).select().single();
    setPosting(false);
    if (error) return toast.error("Couldn't add note");
    setNotes((n) => [data as LeadNote, ...(n ?? [])]);
    setNewNote("");
    toast.success("Note added");
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${lead.name}?`)) return;
    const { error } = await supabase.from("leads").delete().eq("id", lead.id);
    if (error) return toast.error("Couldn't delete");
    onDelete(lead.id);
    toast.success("Lead deleted");
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full sm:max-w-md bg-card border-l border-border shadow-elegant overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card/90 backdrop-blur">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Lead Details</span>
          <div className="flex items-center gap-1">
            <button onClick={handleDelete} className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-primary grid place-items-center text-primary-foreground font-semibold shadow-glow">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-xl font-semibold truncate">{lead.name}</h2>
              <span className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs ${meta.classes}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />{meta.label}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <a href={`mailto:${lead.email}`} className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
              <Mail className="h-4 w-4 text-muted-foreground" />{lead.email}
            </a>
            {lead.phone && (
              <a href={`tel:${lead.phone}`} className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                <Phone className="h-4 w-4 text-muted-foreground" />{lead.phone}
              </a>
            )}
            <div className="flex items-center gap-3 text-muted-foreground">
              <Calendar className="h-4 w-4" />Added {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Status</label>
              <select value={lead.status} onChange={(e) => handleStatus(e.target.value as LeadStatus)}
                className="mt-1.5 w-full rounded-lg bg-input/40 border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {(Object.keys(STATUS_META) as LeadStatus[]).map((s) => (
                  <option key={s} value={s}>{STATUS_META[s].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Source</label>
              <select value={lead.source} onChange={(e) => handleSource(e.target.value as LeadSource)}
                className="mt-1.5 w-full rounded-lg bg-input/40 border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {(Object.keys(SOURCE_LABELS) as LeadSource[]).map((s) => (
                  <option key={s} value={s}>{SOURCE_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">Activity</h3>
            <form onSubmit={handleAddNote} className="mt-3 flex gap-2">
              <input value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add a note or follow-up…"
                className="flex-1 rounded-lg bg-input/40 border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <button type="submit" disabled={posting || !newNote.trim()}
                className="rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>

            <div className="mt-5 relative">
              {notes === null ? (
                <div className="space-y-3">{Array.from({length:3}).map((_,i)=><div key={i} className="h-14 rounded-lg bg-muted/40 animate-pulse" />)}</div>
              ) : (
                <ol className="relative border-l border-border ml-2 space-y-5">
                  <li className="pl-5 relative">
                    <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-success" />
                    <div className="text-sm">Lead created</div>
                    <div className="text-xs text-muted-foreground">{format(new Date(lead.created_at), "PPp")}</div>
                  </li>
                  {notes.slice().reverse().map((n) => (
                    <li key={n.id} className="pl-5 relative">
                      <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                      <div className="text-sm whitespace-pre-wrap">{n.content}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(n.created_at), "PPp")}</div>
                    </li>
                  )).reverse()}
                </ol>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
