-- =========================================================
-- MamaHands Aesthetics & Spa - Supabase Migration Script
-- =========================================================
-- Description: Creates the 'appointments' table, enables RLS
-- policies for public booking & read access, and subscribes the
-- table to Supabase Realtime for live slot syncing.
-- =========================================================

-- 1. Create the appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_ref VARCHAR(20) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    service_id VARCHAR(100) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    duration_minutes INT NOT NULL,
    price_php NUMERIC(10, 2) NOT NULL,
    selected_scent VARCHAR(100),
    selected_add_ons JSONB DEFAULT '[]'::jsonb,
    add_ons_total_php NUMERIC(10, 2) DEFAULT 0,
    total_price_php NUMERIC(10, 2) NOT NULL,
    booking_date DATE NOT NULL,
    booking_time VARCHAR(20) NOT NULL,
    therapist_gender_preference VARCHAR(50) DEFAULT 'No Preference',
    notes TEXT,
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index on date and time for fast real-time slot checking
CREATE INDEX IF NOT EXISTS idx_appointments_date_time 
ON public.appointments (booking_date, booking_time);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if re-running to avoid conflicts
DROP POLICY IF EXISTS "Allow public insert to appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow public read of appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow public update of appointments" ON public.appointments;

-- 5. Create RLS Policies
-- Allow public insert (for customer appointment bookings)
CREATE POLICY "Allow public insert to appointments" 
ON public.appointments FOR INSERT 
WITH CHECK (true);

-- Allow public read (for live slot verification)
CREATE POLICY "Allow public read of appointments" 
ON public.appointments FOR SELECT 
USING (true);

-- Allow public update (for admin status changes)
CREATE POLICY "Allow public update of appointments" 
ON public.appointments FOR UPDATE 
USING (true);

-- 6. Add table to Supabase Realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'appointments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
  END IF;
END $$;
