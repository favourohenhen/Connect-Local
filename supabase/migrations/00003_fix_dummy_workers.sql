-- Step 1: Ensure required columns exist
ALTER TABLE public.workers ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE public.workers ADD COLUMN IF NOT EXISTS specialties TEXT;
ALTER TABLE public.workers ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.workers ADD COLUMN IF NOT EXISTS trust_score INT DEFAULT 80;
ALTER TABLE public.workers ADD COLUMN IF NOT EXISTS recommended_by INT DEFAULT 0;

-- Step 2: Update each dummy worker with proper images and contact info

-- John Doe - Plumber
UPDATE public.workers SET
  profile_image_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  cover_image       = 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
  contact_phone     = '08011111111',
  trust_score       = 88
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Jane Smith - Electrician
UPDATE public.workers SET
  profile_image_url = 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80',
  cover_image       = 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
  contact_phone     = '08022222222',
  trust_score       = 85
WHERE id = '22222222-2222-2222-2222-222222222222';

-- Mike Johnson - Barber / Hair Stylist
UPDATE public.workers SET
  profile_image_url = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  cover_image       = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
  contact_phone     = '08033333333',
  trust_score       = 92
WHERE id = '33333333-3333-3333-3333-333333333333';

-- Sarah Williams - Home Cleaning
UPDATE public.workers SET
  profile_image_url = 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?auto=format&fit=crop&w=300&q=80',
  cover_image       = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
  contact_phone     = '08044444444',
  trust_score       = 90
WHERE id = '44444444-4444-4444-4444-444444444444';

-- David Brown - Carpenter
UPDATE public.workers SET
  profile_image_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
  cover_image       = 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=80',
  contact_phone     = '08055555555',
  trust_score       = 82
WHERE id = '55555555-5555-5555-5555-555555555555';

-- Step 3: Create the recommendation increment function (called when a user says they'd rehire)
CREATE OR REPLACE FUNCTION increment_recommended_by(worker_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.workers
  SET recommended_by = COALESCE(recommended_by, 0) + 1
  WHERE id = worker_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
