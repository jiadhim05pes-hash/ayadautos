CREATE TABLE public.import_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preferred_make_model TEXT NOT NULL,
  year_from INTEGER NOT NULL,
  year_to INTEGER NOT NULL,
  target_budget_kes BIGINT NOT NULL,
  fuel_type TEXT NOT NULL,
  import_type TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT import_requests_year_range_check CHECK (year_from >= 1980 AND year_to <= 2100 AND year_from <= year_to),
  CONSTRAINT import_requests_budget_check CHECK (target_budget_kes > 0),
  CONSTRAINT import_requests_fuel_check CHECK (fuel_type IN ('Any', 'Petrol', 'Diesel', 'Hybrid', 'Electric')),
  CONSTRAINT import_requests_type_check CHECK (import_type IN ('CIF', 'Doorstep'))
);
GRANT SELECT ON public.import_requests TO authenticated;
GRANT ALL ON public.import_requests TO service_role;
ALTER TABLE public.import_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read import requests" ON public.import_requests FOR SELECT TO authenticated USING (public.is_staff_or_admin(auth.uid()));
CREATE INDEX import_requests_created_idx ON public.import_requests (created_at DESC);