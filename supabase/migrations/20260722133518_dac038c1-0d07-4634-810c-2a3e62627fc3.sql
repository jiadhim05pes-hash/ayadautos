
CREATE TABLE IF NOT EXISTS public.site_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE DEFAULT 'default',
  brand_name text NOT NULL DEFAULT 'Ayad Automotives',
  tagline text DEFAULT 'Premium Japanese Imports & Executive Vehicles',
  logo_url text,
  primary_color text DEFAULT '#00F0FF',
  phone text DEFAULT '+254 768 487 356',
  whatsapp text DEFAULT '254768487356',
  email text DEFAULT 'ayadnexas@gmail.com',
  address text DEFAULT 'Ngong Road, Nairobi, Kenya',
  currency text DEFAULT 'KES',
  seo_title text DEFAULT 'Ayad Automotives — Premium Japanese Imports',
  seo_description text DEFAULT 'Nairobi''s premier dealership for executive imports.',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_config TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_config TO authenticated;
GRANT ALL ON public.site_config TO service_role;

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_config public read"
  ON public.site_config FOR SELECT USING (true);

CREATE POLICY "site_config super_admin write"
  ON public.site_config FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER site_config_updated_at
  BEFORE UPDATE ON public.site_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_config (key) VALUES ('default') ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  referrer text,
  session_id text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.page_views TO anon, authenticated;
GRANT SELECT ON public.page_views TO authenticated;
GRANT ALL ON public.page_views TO service_role;

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_views anyone insert"
  ON public.page_views FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "page_views staff read"
  ON public.page_views FOR SELECT TO authenticated
  USING (public.is_staff_or_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS page_views_created_idx ON public.page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_path_idx ON public.page_views (path);

-- Grant super_admin to ayadnexas@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::public.app_role FROM auth.users WHERE email = 'ayadnexas@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
