-- Migration 00002: Upgrade MVP Schema to Support Job-Based Reviews and Seed Dummy Workers

-- 1. Create Jobs Table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own jobs" ON public.jobs FOR SELECT USING (auth.uid() = user_id OR auth.uid() = worker_id);
CREATE POLICY "Users can insert their own jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own jobs" ON public.jobs FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = worker_id);

-- 2. Modify Reviews Table to match MVP Design
ALTER TABLE public.reviews
  ADD COLUMN job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  ADD COLUMN tags TEXT[],
  ADD COLUMN would_rehire BOOLEAN DEFAULT false;

-- Rename customer_id to user_id to match MVP code
ALTER TABLE public.reviews RENAME COLUMN customer_id TO user_id;

-- 3. Add Cover Image, Specialties, and other missing MVP columns to workers (if not exists)
ALTER TABLE public.workers
  ADD COLUMN IF NOT EXISTS cover_image TEXT,
  ADD COLUMN IF NOT EXISTS specialties TEXT,
  ADD COLUMN IF NOT EXISTS street TEXT,
  ADD COLUMN IF NOT EXISTS recommended_by INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 0;

-- 4. Storage Buckets for Images
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Anyone can upload an avatar." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Cover images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'covers');
CREATE POLICY "Anyone can upload a cover." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'covers');

-- 5. Seed Dummy Workers for the Demo
-- First, drop the strict foreign key to auth.users so we can insert fake profiles without needing real auth accounts
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Dummy IDs
DO $$ 
DECLARE
  w1 UUID := '11111111-1111-1111-1111-111111111111';
  w2 UUID := '22222222-2222-2222-2222-222222222222';
  w3 UUID := '33333333-3333-3333-3333-333333333333';
  w4 UUID := '44444444-4444-4444-4444-444444444444';
  w5 UUID := '55555555-5555-5555-5555-555555555555';
BEGIN
  -- Insert Profiles
  INSERT INTO public.profiles (id, role, full_name, phone_number) VALUES
    (w1, 'worker', 'John Doe', '08011111111'),
    (w2, 'worker', 'Jane Smith', '08022222222'),
    (w3, 'worker', 'Mike Johnson', '08033333333'),
    (w4, 'worker', 'Sarah Williams', '08044444444'),
    (w5, 'worker', 'David Brown', '08055555555')
  ON CONFLICT (id) DO NOTHING;

  -- Insert Workers
  INSERT INTO public.workers (id, service_category, location_area, street, is_available, status, recommended_by, bio, specialties) VALUES
    (w1, 'Plumber', 'Urumwon', 'Mechanic Road', true, 'verified', 14, 'Expert plumber with over 10 years of experience fixing leaks, pipes, and installing water systems.', 'Pipe fitting, Leak repair, Water heater'),
    (w2, 'Electrician', 'Urumwon', 'Osakue Road', true, 'verified', 8, 'Licensed electrician handling wiring, faults, and appliance installations.', 'Wiring, Fault finding, Installations'),
    (w3, 'Barber / Hair Stylist', 'Urumwon', 'Opposite Urumwon Primary School', true, 'verified', 25, 'Professional barber offering clean cuts, fades, and beard grooming.', 'Fades, Beard trim, Styling'),
    (w4, 'Home Cleaning', 'Urumwon', 'Idada Street', true, 'verified', 12, 'Thorough home cleaning services. I bring my own supplies and leave your house sparkling.', 'Deep clean, Laundry, Move-in clean'),
    (w5, 'Carpenter', 'Urumwon', 'Groundnut Junction', true, 'verified', 5, 'Custom furniture, repairs, and roofing woodwork.', 'Furniture repair, Roofing, Custom wood')
  ON CONFLICT (id) DO NOTHING;

END $$;
