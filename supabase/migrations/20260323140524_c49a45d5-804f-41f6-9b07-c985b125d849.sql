
-- Report qualitativo por squad
CREATE TABLE public.squad_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sm TEXT NOT NULL,
  squad TEXT NOT NULL,
  week TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(sm, squad, week)
);

ALTER TABLE public.squad_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read squad_reports" ON public.squad_reports FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert squad_reports" ON public.squad_reports FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public update squad_reports" ON public.squad_reports FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete squad_reports" ON public.squad_reports FOR DELETE TO anon, authenticated USING (true);

-- Override manual dos dados dos gráficos
CREATE TABLE public.squad_data_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sm TEXT NOT NULL,
  squad TEXT NOT NULL,
  week TEXT NOT NULL,
  field TEXT NOT NULL,
  value INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(sm, squad, week, field)
);

ALTER TABLE public.squad_data_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read squad_data_overrides" ON public.squad_data_overrides FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert squad_data_overrides" ON public.squad_data_overrides FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public update squad_data_overrides" ON public.squad_data_overrides FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete squad_data_overrides" ON public.squad_data_overrides FOR DELETE TO anon, authenticated USING (true);
