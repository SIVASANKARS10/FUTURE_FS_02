export type LeadStatus = "new" | "contacted" | "converted";
export type LeadSource = "website" | "instagram" | "referral" | "linkedin" | "email" | "other";

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  source: LeadSource;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export const STATUS_META: Record<LeadStatus, { label: string; classes: string; dot: string }> = {
  new: { label: "New", classes: "bg-info/15 text-info border-info/30", dot: "bg-info" },
  contacted: { label: "Contacted", classes: "bg-warning/15 text-warning border-warning/30", dot: "bg-warning" },
  converted: { label: "Converted", classes: "bg-success/15 text-success border-success/30", dot: "bg-success" },
};

export const SOURCE_LABELS: Record<LeadSource, string> = {
  website: "Website",
  instagram: "Instagram",
  referral: "Referral",
  linkedin: "LinkedIn",
  email: "Email",
  other: "Other",
};

export const SAMPLE_LEADS: Omit<Lead, "id" | "user_id" | "created_at" | "updated_at">[] = [
  { name: "Aria Chen", email: "aria@northwind.io", phone: "+1 415 555 0142", source: "website", status: "converted" },
  { name: "Marcus Webb", email: "marcus.w@kestrel.co", phone: "+1 312 555 0188", source: "referral", status: "contacted" },
  { name: "Sofia Marino", email: "sofia@lumen-studio.com", phone: "+39 02 1234 5678", source: "instagram", status: "new" },
  { name: "Daniel Park", email: "dpark@vertex.ai", phone: "+1 206 555 0173", source: "linkedin", status: "contacted" },
  { name: "Eliza Holloway", email: "eliza@brightway.org", phone: "+44 20 7946 0958", source: "email", status: "new" },
  { name: "Ravi Subramanian", email: "ravi@helix.dev", phone: "+91 98 4567 1230", source: "website", status: "converted" },
  { name: "Nora Lindqvist", email: "nora@finn.se", phone: "+46 70 123 4567", source: "referral", status: "new" },
  { name: "Tomás Álvarez", email: "tomas@mesa.es", phone: "+34 91 555 0123", source: "instagram", status: "contacted" },
  { name: "Hana Kobayashi", email: "hana@orbit.jp", phone: "+81 3 5555 0199", source: "linkedin", status: "new" },
  { name: "Jonah Bennett", email: "jonah@reedco.com", phone: "+1 646 555 0119", source: "website", status: "new" },
];

export function exportLeadsCsv(leads: Lead[]) {
  const header = ["Name", "Email", "Phone", "Source", "Status", "Created"];
  const rows = leads.map((l) => [l.name, l.email, l.phone ?? "", l.source, l.status, l.created_at]);
  const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}
