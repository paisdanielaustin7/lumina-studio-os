-- =========================================================================
-- LUMINA STUDIO OS // SUPABASE POSTGRESQL SCHEMA & REAL-TIME PUBLICATION
-- =========================================================================
-- Run this entire script in your Supabase project's SQL Editor (SQL Editor > New Query > Run).

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.lumina_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'SECOND_SHOOTER',
  can_view_finances BOOLEAN NOT NULL DEFAULT false,
  can_access_settings BOOLEAN NOT NULL DEFAULT false,
  can_edit_quotes_and_orders BOOLEAN NOT NULL DEFAULT false,
  can_edit_ledger BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. STUDIO SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.lumina_settings (
  id TEXT PRIMARY KEY DEFAULT 'studio_settings',
  studio_name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  city TEXT NOT NULL,
  has_gst BOOLEAN DEFAULT false,
  gstin TEXT DEFAULT '',
  banking_details JSONB NOT NULL,
  contact_person TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  terms_and_conditions JSONB NOT NULL,
  pdf_theme_color TEXT DEFAULT 'sage',
  custom_palettes JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. QUOTATIONS TABLE
CREATE TABLE IF NOT EXISTS public.lumina_quotations (
  id TEXT PRIMARY KEY,
  quotation_number TEXT NOT NULL,
  date TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_city TEXT NOT NULL,
  client_phone TEXT,
  client_email TEXT,
  package_title TEXT NOT NULL,
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,
  crew_allocation JSONB NOT NULL DEFAULT '[]'::jsonb,
  terms_and_conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_price NUMERIC NOT NULL,
  advance_percentage NUMERIC DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'SENT',
  enquiry_id TEXT,
  booking_id TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 4. ENQUIRIES CRM TABLE
CREATE TABLE IF NOT EXISTS public.lumina_enquiries (
  id TEXT PRIMARY KEY,
  enquiry_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT NOT NULL,
  event_date TEXT NOT NULL,
  event_type TEXT NOT NULL,
  estimated_budget NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'NEW',
  notes TEXT,
  quotation_id TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 5. SHOOT BOOKINGS & CALL SHEETS TABLE
CREATE TABLE IF NOT EXISTS public.lumina_bookings (
  id TEXT PRIMARY KEY,
  shoot_code TEXT NOT NULL,
  title TEXT NOT NULL,
  client JSONB NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CONFIRMED',
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  call_time TEXT NOT NULL,
  location JSONB NOT NULL,
  production_team JSONB NOT NULL DEFAULT '[]'::jsonb,
  shot_list_total INTEGER DEFAULT 0,
  shot_list_completed INTEGER DEFAULT 0,
  financial_summary JSONB NOT NULL,
  schedule_timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
  gear_allocated JSONB NOT NULL DEFAULT '[]'::jsonb,
  editorial_notes TEXT DEFAULT '',
  quotation_id TEXT,
  enquiry_id TEXT,
  delivery_stage TEXT DEFAULT 'RAW_INGESTED',
  hard_drive_received BOOLEAN DEFAULT false,
  client_selection_done BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 6. DUAL LEDGER TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.lumina_ledger (
  id TEXT PRIMARY KEY,
  transaction_ref TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  counterparty TEXT NOT NULL,
  related_shoot_code TEXT,
  status TEXT NOT NULL DEFAULT 'CLEARED',
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 7. TAX INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.lumina_invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  client_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  brand TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL,
  production_fee_tax NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  balance_due NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'UNPAID',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR SECURE CLIENT-SIDE ANON ACCESS
-- =========================================================================
ALTER TABLE public.lumina_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lumina_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lumina_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lumina_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lumina_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lumina_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lumina_invoices ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  -- lumina_users
  DROP POLICY IF EXISTS "Public access lumina_users" ON public.lumina_users;
  CREATE POLICY "Public access lumina_users" ON public.lumina_users FOR ALL USING (true) WITH CHECK (true);

  -- lumina_settings
  DROP POLICY IF EXISTS "Public access lumina_settings" ON public.lumina_settings;
  CREATE POLICY "Public access lumina_settings" ON public.lumina_settings FOR ALL USING (true) WITH CHECK (true);

  -- lumina_quotations
  DROP POLICY IF EXISTS "Public access lumina_quotations" ON public.lumina_quotations;
  CREATE POLICY "Public access lumina_quotations" ON public.lumina_quotations FOR ALL USING (true) WITH CHECK (true);

  -- lumina_enquiries
  DROP POLICY IF EXISTS "Public access lumina_enquiries" ON public.lumina_enquiries;
  CREATE POLICY "Public access lumina_enquiries" ON public.lumina_enquiries FOR ALL USING (true) WITH CHECK (true);

  -- lumina_bookings
  DROP POLICY IF EXISTS "Public access lumina_bookings" ON public.lumina_bookings;
  CREATE POLICY "Public access lumina_bookings" ON public.lumina_bookings FOR ALL USING (true) WITH CHECK (true);

  -- lumina_ledger
  DROP POLICY IF EXISTS "Public access lumina_ledger" ON public.lumina_ledger;
  CREATE POLICY "Public access lumina_ledger" ON public.lumina_ledger FOR ALL USING (true) WITH CHECK (true);

  -- lumina_invoices
  DROP POLICY IF EXISTS "Public access lumina_invoices" ON public.lumina_invoices;
  CREATE POLICY "Public access lumina_invoices" ON public.lumina_invoices FOR ALL USING (true) WITH CHECK (true);
END $$;

-- Explicitly grant permissions to anon and authenticated API roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.lumina_users, public.lumina_settings, public.lumina_quotations, public.lumina_enquiries, public.lumina_bookings, public.lumina_ledger, public.lumina_invoices TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- =========================================================================
-- REAL-TIME WEBSOCKET REPLICATION
-- =========================================================================
-- Enable real-time broadcast so Desktop & Mobile instantly sync without manual page refresh
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.lumina_users, public.lumina_settings, public.lumina_quotations, public.lumina_enquiries, public.lumina_bookings, public.lumina_ledger, public.lumina_invoices;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;

-- =========================================================================
-- DEFAULT SEED DATA (MANGALORE ATELIER)
-- =========================================================================

-- Seed Users (if not present)
INSERT INTO public.lumina_users (id, username, password, full_name, role, can_view_finances, can_access_settings, can_edit_quotes_and_orders, can_edit_ledger)
VALUES 
  ('usr-admin', 'admin', 'adminoflumina123', 'Studio Director Dan Aurel', 'ADMIN_DIRECTOR', true, true, true, true),
  ('usr-roshan', 'roshan', 'crewpass123', 'Roshan D’Silva (Lead 2nd Unit)', 'SECOND_SHOOTER', false, false, false, false),
  ('usr-farooq', 'farooq', 'ditpass123', 'Farooq Mansoor (DIT & Colorist)', 'SECOND_SHOOTER', false, false, false, false)
ON CONFLICT (id) DO NOTHING;

-- Seed Studio Settings (if not present)
INSERT INTO public.lumina_settings (
  id, studio_name, tagline, city, has_gst, gstin, banking_details, contact_person, contact_phone, terms_and_conditions, pdf_theme_color, custom_palettes
) VALUES (
  'studio_settings',
  'LUMINA',
  'Wedding Cinemastory & Stills // Mangalore',
  'Mangalore, Karnataka',
  false,
  '',
  '{"accountName": "LUMINA ATELIER STUDIOS LLP", "bankName": "HDFC Bank Ltd", "branch": "Hampankatta Branch, Mangalore", "accountNumber": "50200084920194", "ifscCode": "HDFC0000084", "upiId": "lumina.studios@hdfcbank"}'::jsonb,
  'DAN AUREL',
  '+91 9380057445',
  '["A 50% advance is required to confirm the booking. Dates are secured only after payment.", "Remaining balance must be cleared on or before the event date.", "Advance is non-refundable. Date changes are subject to availability.", "Final photos/videos will be delivered within 2-6 weeks.", "Travel And Accommodation Need To be Provided If Requested.", "Accommodation is not included in the above quotation and has to be provided by the client.", "We reserve the right to use content for portfolio and promotional purposes.", "In case of unforeseen issues, liability is limited to the amount paid.", "Delays from the client side may impact coverage. We are not responsible for reduced deliverables due to time loss.", "Additional Photos For Album Or Sheets Will Be Charged Additional.", "Photo Selection for the album done by the Client.", "Couple needs to provide a Hard Drive for the collection of RAW data, agency will not be liable for anykind of DATA LOSS after 6 months from the shoot date."]'::jsonb,
  'sage',
  '[]'::jsonb
) ON CONFLICT (id) DO NOTHING;
