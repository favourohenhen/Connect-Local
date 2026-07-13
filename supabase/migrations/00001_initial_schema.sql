-- ENUMS
CREATE TYPE user_role AS ENUM ('customer', 'worker', 'admin');
CREATE TYPE verification_status AS ENUM ('unverified', 'verified', 'highly_verified', 'under_review', 'banned');

-- PROFILES
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL,
  phone_number TEXT UNIQUE,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WORKERS (Extension of Profiles)
CREATE TABLE public.workers (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  service_category TEXT NOT NULL,
  location_area TEXT NOT NULL,
  street TEXT,
  years_experience INT DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  contact_phone TEXT,
  profile_image_url TEXT,
  bio TEXT,
  status verification_status DEFAULT 'unverified',
  trust_score INT DEFAULT 0,
  recommended_by INT DEFAULT 0,
  known_landmark TEXT,
  referrer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PORTFOLIO IMAGES
CREATE TABLE public.worker_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  feedback_tag TEXT,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- REPORTS
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Workers: Everyone can view workers, workers can update their own worker profile
CREATE POLICY "Workers are viewable by everyone" ON public.workers FOR SELECT USING (true);
CREATE POLICY "Workers can update their own profile" ON public.workers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Workers can insert their own worker profile" ON public.workers FOR INSERT WITH CHECK (auth.uid() = id);

-- Portfolios: Viewable by all, workers can insert/update/delete their own portfolios
CREATE POLICY "Portfolios viewable by everyone" ON public.worker_portfolios FOR SELECT USING (true);
CREATE POLICY "Workers can manage their portfolios" ON public.worker_portfolios FOR ALL USING (auth.uid() = worker_id);

-- Reviews: Viewable by all, customers can insert reviews
CREATE POLICY "Reviews viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Customers can insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Reports: Users can insert, only admins can view
CREATE POLICY "Users can insert reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
-- (Admin policy omitted for brevity, assume handled via Supabase dashboard roles or RPC)
