-- Enums
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'converted');
CREATE TYPE public.lead_source AS ENUM ('website', 'instagram', 'referral', 'linkedin', 'email', 'other');

-- Leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  source public.lead_source NOT NULL DEFAULT 'website',
  status public.lead_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_user_id ON public.leads(user_id);
CREATE INDEX idx_leads_status ON public.leads(status);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own leads" ON public.leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own leads" ON public.leads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own leads" ON public.leads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own leads" ON public.leads FOR DELETE USING (auth.uid() = user_id);

-- Lead notes table
CREATE TABLE public.lead_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lead_notes_lead_id ON public.lead_notes(lead_id);

ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notes" ON public.lead_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own notes" ON public.lead_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own notes" ON public.lead_notes FOR DELETE USING (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();