
-- =========================================================
-- 1. ROLES & PROFILES
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'user');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff_or_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','staff'))
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Generic updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 2. INVENTORY
-- =========================================================
CREATE TYPE public.vehicle_status AS ENUM ('available', 'reserved', 'sold', 'draft');
CREATE TYPE public.fuel_type AS ENUM ('Petrol', 'Diesel', 'Hybrid', 'Electric');
CREATE TYPE public.transmission_type AS ENUM ('Automatic', 'Manual');
CREATE TYPE public.registration_type AS ENUM ('Fresh Import', 'New Registration', 'Locally Used');

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.is_staff_or_admin(auth.uid())) WITH CHECK (public.is_staff_or_admin(auth.uid()));

CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT NOT NULL,
  price_kes NUMERIC(12,2) NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  fuel fuel_type NOT NULL,
  transmission transmission_type NOT NULL,
  mileage_km INT NOT NULL DEFAULT 0,
  registration registration_type NOT NULL DEFAULT 'Locally Used',
  description TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  primary_image TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  status vehicle_status NOT NULL DEFAULT 'available',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vehicles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read available vehicles" ON public.vehicles FOR SELECT TO anon, authenticated
  USING (status IN ('available','reserved','sold'));
CREATE POLICY "Staff read all vehicles" ON public.vehicles FOR SELECT TO authenticated
  USING (public.is_staff_or_admin(auth.uid()));
CREATE POLICY "Staff manage vehicles" ON public.vehicles FOR ALL TO authenticated
  USING (public.is_staff_or_admin(auth.uid())) WITH CHECK (public.is_staff_or_admin(auth.uid()));
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_vehicles_status ON public.vehicles(status);
CREATE INDEX idx_vehicles_featured ON public.vehicles(featured) WHERE featured;
CREATE INDEX idx_vehicles_category ON public.vehicles(category_id);

CREATE TABLE public.vehicle_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vehicle_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.vehicle_images TO authenticated;
GRANT ALL ON public.vehicle_images TO service_role;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read images" ON public.vehicle_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff manage images" ON public.vehicle_images FOR ALL TO authenticated
  USING (public.is_staff_or_admin(auth.uid())) WITH CHECK (public.is_staff_or_admin(auth.uid()));
CREATE INDEX idx_vehicle_images_vehicle ON public.vehicle_images(vehicle_id);

-- =========================================================
-- 3. LEADS & INQUIRIES
-- =========================================================
CREATE TYPE public.lead_status AS ENUM ('new', 'in_progress', 'contacted', 'won', 'lost', 'archived');

CREATE TABLE public.test_drive_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  vehicle_name TEXT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  preferred_date DATE,
  notes TEXT,
  status lead_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.test_drive_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.test_drive_requests TO authenticated;
GRANT ALL ON public.test_drive_requests TO service_role;
ALTER TABLE public.test_drive_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit test drive" ON public.test_drive_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff manage test drives" ON public.test_drive_requests FOR ALL TO authenticated
  USING (public.is_staff_or_admin(auth.uid())) WITH CHECK (public.is_staff_or_admin(auth.uid()));

CREATE TABLE public.finance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  vehicle_name TEXT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  vehicle_price NUMERIC(12,2),
  deposit NUMERIC(12,2),
  term_months INT,
  monthly_income NUMERIC(12,2),
  notes TEXT,
  status lead_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.finance_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.finance_requests TO authenticated;
GRANT ALL ON public.finance_requests TO service_role;
ALTER TABLE public.finance_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit finance" ON public.finance_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff manage finance" ON public.finance_requests FOR ALL TO authenticated
  USING (public.is_staff_or_admin(auth.uid())) WITH CHECK (public.is_staff_or_admin(auth.uid()));

CREATE TABLE public.trade_in_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT,
  mileage_km INT,
  condition TEXT,
  estimated_value_kes NUMERIC(12,2),
  photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  status lead_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.trade_in_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.trade_in_requests TO authenticated;
GRANT ALL ON public.trade_in_requests TO service_role;
ALTER TABLE public.trade_in_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit trade-in" ON public.trade_in_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff manage trade-ins" ON public.trade_in_requests FOR ALL TO authenticated
  USING (public.is_staff_or_admin(auth.uid())) WITH CHECK (public.is_staff_or_admin(auth.uid()));

CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status lead_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff manage contacts" ON public.contact_messages FOR ALL TO authenticated
  USING (public.is_staff_or_admin(auth.uid())) WITH CHECK (public.is_staff_or_admin(auth.uid()));

CREATE TABLE public.ai_chat_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  name TEXT,
  phone TEXT,
  email TEXT,
  interested_vehicle TEXT,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  budget_kes NUMERIC(12,2),
  finance_interest BOOLEAN NOT NULL DEFAULT false,
  trade_in_interest BOOLEAN NOT NULL DEFAULT false,
  preferred_viewing_date DATE,
  language TEXT,
  transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
  qualified BOOLEAN NOT NULL DEFAULT false,
  escalated_to_human BOOLEAN NOT NULL DEFAULT false,
  status lead_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT, UPDATE ON public.ai_chat_leads TO anon, authenticated;
GRANT SELECT, DELETE ON public.ai_chat_leads TO authenticated;
GRANT ALL ON public.ai_chat_leads TO service_role;
ALTER TABLE public.ai_chat_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create ai lead" ON public.ai_chat_leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Session updates own ai lead" ON public.ai_chat_leads FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Staff manage ai leads" ON public.ai_chat_leads FOR ALL TO authenticated
  USING (public.is_staff_or_admin(auth.uid())) WITH CHECK (public.is_staff_or_admin(auth.uid()));
CREATE TRIGGER update_ai_chat_leads_updated_at BEFORE UPDATE ON public.ai_chat_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 4. SEED CATEGORIES
-- =========================================================
INSERT INTO public.categories (slug, name, sort_order) VALUES
  ('suv', 'SUV', 1),
  ('sedan', 'Sedan', 2),
  ('luxury', 'Luxury', 3),
  ('family-car', 'Family Car', 4),
  ('hatchback', 'Hatchback', 5);
