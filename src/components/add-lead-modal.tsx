import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Lead, LeadSource, LeadStatus } from "@/lib/leads";
import { STATUS_META, SOURCE_LABELS } from "@/lib/leads";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(120),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
});

interface Props { onClose: () => void; onCreated: (lead: Lead) => void }

export function AddLeadModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", source: "website" as LeadSource, status: "new" as LeadStatus });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const fe: Record<string, string> = {};
      result.error.issues.forEach((i) => { fe[i.path[0] as string] = i.message; });
      setErrors(fe);
      return;
    }
    setErrors({});
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data, error } = await supabase.from("leads").insert({
      user_id: user.id,
      name: form.name.trim(), email: form.email.trim(),
      phone: form.phone.trim() || null,
      source: form.source, status: form.status,
    }).select().single();
    setLoading(false);
    if (error) return toast.error(error.message);
    onCreated(data as Lead);
    toast.success("Lead added");
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 grid place-items-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-border bg-card shadow-elegant animate-in zoom-in-95 fade-in duration-200">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-display text-lg font-semibold">New lead</h2>
            <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={submit} className="p-5 space-y-4">
            <Field label="Name" error={errors.name}>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus
                className="w-full rounded-lg bg-input/40 border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Aria Chen" />
            </Field>
            <Field label="Email" error={errors.email}>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg bg-input/40 border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="aria@company.com" />
            </Field>
            <Field label="Phone (optional)" error={errors.phone}>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg bg-input/40 border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="+1 555 0100" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Source">
                <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value as LeadSource })}
                  className="w-full rounded-lg bg-input/40 border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  {(Object.keys(SOURCE_LABELS) as LeadSource[]).map((s) => <option key={s} value={s}>{SOURCE_LABELS[s]}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as LeadStatus })}
                  className="w-full rounded-lg bg-input/40 border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  {(Object.keys(STATUS_META) as LeadStatus[]).map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                </select>
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow-glow hover:bg-primary/90 disabled:opacity-60">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />} Create lead
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-1.5">{children}</div>
      {error && <div className="mt-1 text-xs text-destructive">{error}</div>}
    </div>
  );
}
