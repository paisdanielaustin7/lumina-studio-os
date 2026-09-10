-- ==============================================================================
-- LUMINA STUDIO OS — SUPABASE RELATIONAL SCHEMA
-- High-Fashion Creative Photography Operating Engine & CRM
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Custom Enumerations
CREATE TYPE user_role AS ENUM (
  'ADMIN_DIRECTOR',
  'SECOND_SHOOTER',
  'PRODUCER',
  'CLIENT_VIEWER'
);

CREATE TYPE client_tier AS ENUM (
  'HAUTE_COUTURE',
  'COMMERCIAL_LUXURY',
  'EDITORIAL_PRESS',
  'PRIVATE_ESTATE'
);

CREATE TYPE shoot_type AS ENUM (
  'Haute Couture Editorial',
  'Architectural Digest Feature',
  'Commercial Campaign',
  'High Jewelry Lookbook',
  'Parisian Runway Motion',
  'Automotive Avant-Garde'
);

CREATE TYPE shoot_status AS ENUM (
  'TENTATIVE',
  'CONFIRMED',
  'IN_PRODUCTION',
  'POST_PROCESSING',
  'DELIVERED',
  'ARCHIVED'
);

CREATE TYPE ledger_category AS ENUM (
  'CLIENT_RECEIVABLE',
  'GEAR_RENTAL',
  'STUDIO_OVERHEAD',
  'TALENT_PAYOUT',
  'LOCATION_PERMIT',
  'POST_COLOR_GRADE'
);

CREATE TYPE ledger_status AS ENUM (
  'CLEARED',
  'PENDING',
  'OVERDUE',
  'DISPUTED'
);

CREATE TYPE invoice_status AS ENUM (
  'DRAFT',
  'UNPAID',
  'PARTIAL',
  'PAID',
  'OVERDUE',
  'VOID'
);

-- ==============================================================================
-- 3. Studio Profiles / Access Control Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  callsign TEXT,
  role user_role DEFAULT 'SECOND_SHOOTER' NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 4. Clients Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  brand_tier client_tier DEFAULT 'COMMERCIAL_LUXURY' NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  city TEXT NOT NULL,
  billing_address TEXT,
  tax_id TEXT,
  notes TEXT,
  status TEXT DEFAULT 'ACTIVE' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 5. Shoot Bookings & Call Sheets Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.shoot_bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shoot_code TEXT UNIQUE NOT NULL, -- e.g. LUM-PARIS-26
  client_id UUID REFERENCES public.clients(id) ON DELETE RESTRICT NOT NULL,
  title TEXT NOT NULL,
  type shoot_type NOT NULL,
  status shoot_status DEFAULT 'CONFIRMED' NOT NULL,
  shoot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  call_time TEXT NOT NULL,
  
  -- Location & Logistics
  location_name TEXT NOT NULL,
  location_city TEXT NOT NULL,
  coordinates TEXT, -- e.g. "48.8519° N, 2.3619° E"
  access_code TEXT,
  
  -- Shot List Metrics
  shot_list_total INT DEFAULT 0 NOT NULL,
  shot_list_completed INT DEFAULT 0 NOT NULL,
  
  -- Financial Ledger Overview
  total_fee NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  retainer_paid NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  balance_due NUMERIC(12, 2) GENERATED ALWAYS AS (total_fee - retainer_paid) STORED,
  currency TEXT DEFAULT 'INR' NOT NULL,
  
  -- Complex production schedule stored as structured JSONB
  schedule_timeline JSONB DEFAULT '[]'::jsonb,
  crew_roster JSONB DEFAULT '[]'::jsonb,
  gear_allocated JSONB DEFAULT '[]'::jsonb,
  editorial_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 6. Invoices Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE RESTRICT NOT NULL,
  shoot_id UUID REFERENCES public.shoot_bookings(id) ON DELETE SET NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  tax_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  total_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  amount_paid NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  balance_due NUMERIC(12, 2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
  status invoice_status DEFAULT 'UNPAID' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Line Items for Invoices
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(6, 2) DEFAULT 1 NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL,
  total NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 7. Live Ledger (Client Receivables vs Production/Gear Expenses)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  transaction_ref TEXT UNIQUE NOT NULL, -- REC-2026-901 or EXP-2026-442
  shoot_id UUID REFERENCES public.shoot_bookings(id) ON DELETE SET NULL,
  entry_date DATE DEFAULT CURRENT_DATE NOT NULL,
  description TEXT NOT NULL,
  category ledger_category NOT NULL,
  type TEXT CHECK (type IN ('INCOME', 'EXPENSE')) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  counterparty TEXT NOT NULL, -- Client or Vendor name
  status ledger_status DEFAULT 'CLEARED' NOT NULL,
  payment_method TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 8. High-Performance Indexes
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_shoot_date ON public.shoot_bookings(shoot_date);
CREATE INDEX IF NOT EXISTS idx_shoot_status ON public.shoot_bookings(status);
CREATE INDEX IF NOT EXISTS idx_shoot_client ON public.shoot_bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_ledger_date ON public.ledger_entries(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_type ON public.ledger_entries(type);
CREATE INDEX IF NOT EXISTS idx_ledger_category ON public.ledger_entries(category);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- ==============================================================================
-- 9. Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shoot_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

-- Admins / Studio Directors have full CRUD access
CREATE POLICY "Full access for authenticated studio directors"
  ON public.shoot_bookings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('ADMIN_DIRECTOR', 'PRODUCER')
    )
  );

-- Second Shooters can read confirmed call-sheets
CREATE POLICY "Read-only access for second shooters"
  ON public.shoot_bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'SECOND_SHOOTER'
    )
  );

-- Ledger access restricted strictly to Admin Directors & Producers
CREATE POLICY "Strict ledger access for directors"
  ON public.ledger_entries FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN_DIRECTOR'
    )
  );
