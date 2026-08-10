ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS engine text,
  ADD COLUMN IF NOT EXISTS exterior_color text,
  ADD COLUMN IF NOT EXISTS interior_color text,
  ADD COLUMN IF NOT EXISTS interior_material text;