
CREATE TABLE public.weekly_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sm TEXT NOT NULL,
  week TEXT NOT NULL,
  q1 TEXT NOT NULL DEFAULT '',
  q2 TEXT NOT NULL DEFAULT '',
  q3 TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read weekly_reports"
  ON public.weekly_reports FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert weekly_reports"
  ON public.weekly_reports FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public delete weekly_reports"
  ON public.weekly_reports FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sm TEXT NOT NULL,
  squad TEXT NOT NULL,
  date TEXT NOT NULL,
  cone BOOLEAN,
  cone_text TEXT NOT NULL DEFAULT '',
  pdti BOOLEAN,
  pdti_text TEXT NOT NULL DEFAULT '',
  parado BOOLEAN,
  parado_text TEXT NOT NULL DEFAULT '',
  wip_epic BOOLEAN,
  wip_epic_text TEXT NOT NULL DEFAULT '',
  wip_us BOOLEAN,
  wip_us_text TEXT NOT NULL DEFAULT '',
  o_que TEXT NOT NULL DEFAULT '',
  problemas TEXT NOT NULL DEFAULT '',
  acoes TEXT NOT NULL DEFAULT '',
  images JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read reports"
  ON public.reports FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert reports"
  ON public.reports FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public delete reports"
  ON public.reports FOR DELETE
  TO anon, authenticated
  USING (true);
