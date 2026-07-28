-- ============================================================
-- Migration 00005: Replace all dummy workers with 12 realistic
-- Nigerian-named workers and profession-matched images.
-- ============================================================

-- ── Step 1: Delete old dummy data ──────────────────────────
-- Remove portfolio entries first (FK dependency)
DELETE FROM public.worker_portfolios
WHERE worker_id IN (
  '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'c1000001-0000-0000-0000-000000000001', 'c1000002-0000-0000-0000-000000000002', 'c1000003-0000-0000-0000-000000000003',
  'c1000004-0000-0000-0000-000000000004', 'c1000005-0000-0000-0000-000000000005', 'c1000006-0000-0000-0000-000000000006',
  'c1000007-0000-0000-0000-000000000007', 'c1000008-0000-0000-0000-000000000008', 'c1000009-0000-0000-0000-000000000009',
  'c1000010-0000-0000-0000-000000000010', 'c1000011-0000-0000-0000-000000000011', 'c1000012-0000-0000-0000-000000000012'
);

DELETE FROM public.reviews
WHERE worker_id IN (
  '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'c1000001-0000-0000-0000-000000000001', 'c1000002-0000-0000-0000-000000000002', 'c1000003-0000-0000-0000-000000000003',
  'c1000004-0000-0000-0000-000000000004', 'c1000005-0000-0000-0000-000000000005', 'c1000006-0000-0000-0000-000000000006',
  'c1000007-0000-0000-0000-000000000007', 'c1000008-0000-0000-0000-000000000008', 'c1000009-0000-0000-0000-000000000009',
  'c1000010-0000-0000-0000-000000000010', 'c1000011-0000-0000-0000-000000000011', 'c1000012-0000-0000-0000-000000000012'
);

DELETE FROM public.workers
WHERE id IN (
  '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'c1000001-0000-0000-0000-000000000001', 'c1000002-0000-0000-0000-000000000002', 'c1000003-0000-0000-0000-000000000003',
  'c1000004-0000-0000-0000-000000000004', 'c1000005-0000-0000-0000-000000000005', 'c1000006-0000-0000-0000-000000000006',
  'c1000007-0000-0000-0000-000000000007', 'c1000008-0000-0000-0000-000000000008', 'c1000009-0000-0000-0000-000000000009',
  'c1000010-0000-0000-0000-000000000010', 'c1000011-0000-0000-0000-000000000011', 'c1000012-0000-0000-0000-000000000012'
);

DELETE FROM public.profiles
WHERE id IN (
  '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'c1000001-0000-0000-0000-000000000001', 'c1000002-0000-0000-0000-000000000002', 'c1000003-0000-0000-0000-000000000003',
  'c1000004-0000-0000-0000-000000000004', 'c1000005-0000-0000-0000-000000000005', 'c1000006-0000-0000-0000-000000000006',
  'c1000007-0000-0000-0000-000000000007', 'c1000008-0000-0000-0000-000000000008', 'c1000009-0000-0000-0000-000000000009',
  'c1000010-0000-0000-0000-000000000010', 'c1000011-0000-0000-0000-000000000011', 'c1000012-0000-0000-0000-000000000012'
);

-- ── Step 2: Insert 12 new Nigerian-named dummy workers ──────
DO $$
DECLARE
  w1  UUID := 'c1000001-0000-0000-0000-000000000001';
  w2  UUID := 'c1000002-0000-0000-0000-000000000002';
  w3  UUID := 'c1000003-0000-0000-0000-000000000003';
  w4  UUID := 'c1000004-0000-0000-0000-000000000004';
  w5  UUID := 'c1000005-0000-0000-0000-000000000005';
  w6  UUID := 'c1000006-0000-0000-0000-000000000006';
  w7  UUID := 'c1000007-0000-0000-0000-000000000007';
  w8  UUID := 'c1000008-0000-0000-0000-000000000008';
  w9  UUID := 'c1000009-0000-0000-0000-000000000009';
  w10 UUID := 'c1000010-0000-0000-0000-000000000010';
  w11 UUID := 'c1000011-0000-0000-0000-000000000011';
  w12 UUID := 'c1000012-0000-0000-0000-000000000012';
BEGIN

  -- ── Profiles ────────────────────────────────────────────
  INSERT INTO public.profiles (id, role, full_name, phone_number) VALUES
    (w1,  'worker', 'Chukwuemeka Obi',    '08031110001'),
    (w2,  'worker', 'Babatunde Adeyemi',  '08031110002'),
    (w3,  'worker', 'Emmanuel Nwosu',     '08031110003'),
    (w4,  'worker', 'Festus Osagie',      '08031110004'),
    (w5,  'worker', 'Sunday Okoro',       '08031110005'),
    (w6,  'worker', 'Blessing Nwachukwu', '08031110006'),
    (w7,  'worker', 'Chisom Ezenwachi',   '08031110007'),
    (w8,  'worker', 'Ngozi Okonkwo',      '08031110008'),
    (w9,  'worker', 'Ifeanyi Eze',        '08031110009'),
    (w10, 'worker', 'Amaka Uche',         '08031110010'),
    (w11, 'worker', 'Taiwo Olawale',      '08031110011'),
    (w12, 'worker', 'Emeka Chukwu',       '08031110012')
  ON CONFLICT (id) DO NOTHING;

  -- ── Workers ─────────────────────────────────────────────
  INSERT INTO public.workers (
    id, service_category, location_area, street,
    is_available, status, years_experience,
    bio, profile_image_url, cover_image,
    contact_phone, trust_score, recommended_by, specialties,
    created_at
  ) VALUES

    -- 1. Electrician – Chukwuemeka Obi
    (w1, 'Electrician', 'Urumwon', 'Mechanic Road',
     true, 'verified', 9,
     'Licensed electrician with 9 years of experience in residential and commercial wiring. From fault finding to full panel installations, I handle every job with care and safety.',
     'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=300&q=80',
     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
     '08031110001', 94, 21,
     'Panel Installation, Fault Finding, Rewiring, Generator Connection', now() - interval '1 hour'),

    -- 2. Plumber – Babatunde Adeyemi
    (w2, 'Plumber', 'Urumwon', 'Osakue Road',
     true, 'verified', 12,
     'Expert plumber serving Urumwon for over 12 years. I specialise in pipe fitting, leak repairs, water heater installation, and drainage clearing. Available for emergency calls.',
     'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=300&q=80',
     'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
     '08031110002', 91, 18,
     'Pipe Fitting, Leak Repair, Water Heater, Drainage', now() - interval '2 days'),

    -- 3. Carpenter – Emmanuel Nwosu
    (w3, 'Carpenter', 'Urumwon', 'Opposite Urumwon Primary School',
     true, 'verified', 7,
     'Skilled carpenter crafting custom furniture, wardrobes, and wooden fittings. I work with both hardwood and plywood to bring your home ideas to life at affordable prices.',
     'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80',
     'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=80',
     '08031110003', 89, 15,
     'Custom Furniture, Wardrobes, Door Frames, Wood Polish', now() - interval '4 days'),

    -- 4. Painter – Festus Osagie
    (w4, 'Painting & Design', 'Urumwon', 'Idada Street',
     true, 'verified', 6,
     'Professional painter offering neat and durable interior and exterior painting. I use quality emulsion and gloss paints. Walls, ceilings, fences — no job is too big or small.',
     'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=300&q=80',
     'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
     '08031110004', 86, 12,
     'Interior Painting, Exterior Painting, Wallpapers, POP Finishing', now() - interval '6 days'),

    -- 5. Welder – Sunday Okoro
    (w5, 'Welder', 'Urumwon', 'Groundnut Junction',
     true, 'verified', 10,
     'Experienced fabricator and welder. I build gates, iron doors, security fences, and burglar-proof windows to order. Durable, clean welds guaranteed.',
     'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=300&q=80',
     'https://plus.unsplash.com/premium_photo-1661963236181-9eb0c8d766e3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
     '08031110005', 88, 9,
     'Gate Fabrication, Iron Doors, Burglar Proof, Arc Welding', now() - interval '8 days'),

    -- 6. Baker – Blessing Nwachukwu
    (w6, 'Baker', 'Urumwon', 'Mechanic Road',
     true, 'verified', 5,
     'Home baker specialising in cakes, chin-chin, puff puff, and small chops. I bake fresh to order for birthdays, events, or daily supply. Hygienic and delicious every time.',
     'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=300&q=80',
     'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
     '08031110006', 92, 24,
     'Birthday Cakes, Chin-Chin, Puff Puff, Small Chops, Bread', now() - interval '10 days'),

    -- 7. Tailor/Fashion Designer – Chisom Ezenwachi
    (w7, 'Tailor / Fashion Designer', 'Urumwon', 'Osakue Road',
     true, 'verified', 8,
     'Creative fashion designer and tailor. I sew native attires, corporate outfits, school uniforms, and occasion wear. Bring your fabric or choose from my collection.',
     'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80',
     'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=800&q=80',
     '08031110007', 93, 27,
     'Native Wear, Corporate Outfits, Uniforms, Alterations', now() - interval '12 days'),

    -- 8. Hair Stylist – Ngozi Okonkwo
    (w8, 'Hair Stylist', 'Urumwon', 'Opposite Urumwon Primary School',
     true, 'verified', 6,
     'Professional hair stylist offering braiding, weave-on, natural hair treatments, and relaxers. I come to your home or you visit my salon. Clean, creative, and affordable.',
     'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=300&q=80',
     'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
     '08031110008', 90, 31,
     'Braiding, Weave-On, Natural Hair, Relaxer, Styling', now() - interval '15 days'),

    -- 9. Barber – Ifeanyi Eze
    (w9, 'Barber', 'Urumwon', 'Idada Street',
     true, 'verified', 5,
     'Sharp and experienced barber. I specialise in low cuts, fades, and beard grooming. Mobile service available — I come to your house with my full kit.',
     'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=300&q=80',
     'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
     '08031110009', 87, 19,
     'Low Cut, Fade, Beard Grooming, Mobile Barbing', now() - interval '18 days'),

    -- 10. House Cleaner – Amaka Uche
    (w10, 'Home Cleaning', 'Urumwon', 'Groundnut Junction',
     true, 'verified', 4,
     'Thorough and trustworthy house cleaner. I clean rooms, bathrooms, kitchens, and whole apartments. I bring my own cleaning supplies and leave every space spotless.',
     'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=300&q=80',
     'https://plus.unsplash.com/premium_photo-1667520405114-47d3677f966e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
     '08031110010', 85, 16,
     'Deep Cleaning, Kitchen Cleaning, Bathroom, Move-In Clean', now() - interval '22 days'),

    -- 11. Laundry/Dry Cleaner – Taiwo Olawale (currently busy)
    (w11, 'Laundry & Dry Cleaning', 'Urumwon', 'Mechanic Road',
     false, 'verified', 7,
     'Fast and reliable laundry and dry cleaning service. 24-hour turnaround on most items. I handle native wear, work clothes, bedsheets, and delicate fabrics with care.',
     'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=300&q=80',
     'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=800&q=80',
     '08031110011', 82, 11,
     'Ironing, Dry Cleaning, Stain Removal, Native Wear', now() - interval '26 days'),

    -- 12. Phone & Computer Repair – Emeka Chukwu (pending verification)
    (w12, 'Phone & Computer Repair', 'Urumwon', 'Osakue Road',
     true, 'unverified', 3,
     'Skilled phone and laptop technician. I fix cracked screens, bad batteries, software faults, and charging ports. Quick diagnosis, fair pricing, and warranty on repairs.',
     'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=300&q=80',
     'https://images.unsplash.com/photo-1598327105854-c8674faddf79?auto=format&fit=crop&w=800&q=80',
     '08031110012', 78, 6,
     'Screen Replacement, Battery Fix, Software Repair, Laptop', now() - interval '30 days')

  ON CONFLICT (id) DO NOTHING;

  -- ── Portfolio Images (3 per worker) ──────────────────────

  -- Electrician (Chukwuemeka Obi)
  INSERT INTO public.worker_portfolios (worker_id, image_url, description) VALUES
    (w1, 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80', 'Electrical panel installation'),
    (w1, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80', 'Residential wiring project'),
    (w1, 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=600&q=80', 'Generator connection and setup');

  -- Plumber (Babatunde Adeyemi)
  INSERT INTO public.worker_portfolios (worker_id, image_url, description) VALUES
    (w2, 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80', 'Pipe fitting job completed'),
    (w2, 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80', 'Water heater installation'),
    (w2, 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=600&q=80', 'Bathroom plumbing work');

  -- Carpenter (Emmanuel Nwosu)
  INSERT INTO public.worker_portfolios (worker_id, image_url, description) VALUES
    (w3, 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=600&q=80', 'Custom wardrobe build'),
    (w3, 'https://images.unsplash.com/photo-1580893246395-52aead8960dc?auto=format&fit=crop&w=600&q=80', 'Wooden furniture set'),
    (w3, 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80', 'Carpentry workmanship');

  -- Painter (Festus Osagie)
  INSERT INTO public.worker_portfolios (worker_id, image_url, description) VALUES
    (w4, 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80', 'Interior wall painting'),
    (w4, 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80', 'Exterior house painting'),
    (w4, 'https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?auto=format&fit=crop&w=600&q=80', 'Ceiling and POP finishing');

  -- Welder (Sunday Okoro)
  INSERT INTO public.worker_portfolios (worker_id, image_url, description) VALUES
    (w5, 'https://loremflickr.com/600/600/welding,sparks', 'Security gate fabricated'),
    (w5, 'https://loremflickr.com/600/600/welding,metal', 'Iron door installation'),
    (w5, 'https://loremflickr.com/600/600/welding,worker', 'Arc welding close-up');

  -- Baker (Blessing Nwachukwu)
  INSERT INTO public.worker_portfolios (worker_id, image_url, description) VALUES
    (w6, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80', 'Decorated birthday cake'),
    (w6, 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=600&q=80', 'Pastries and small chops'),
    (w6, 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=600&q=80', 'Freshly baked bread loaves');

  -- Tailor/Fashion Designer (Chisom Ezenwachi)
  INSERT INTO public.worker_portfolios (worker_id, image_url, description) VALUES
    (w7, 'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=600&q=80', 'Native agbada sewing'),
    (w7, 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80', 'Ankara dress design'),
    (w7, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80', 'Corporate outfit completed');

  -- Hair Stylist (Ngozi Okonkwo)
  INSERT INTO public.worker_portfolios (worker_id, image_url, description) VALUES
    (w8, 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=600&q=80', 'Box braids styling'),
    (w8, 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80', 'Weave-on application'),
    (w8, 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&q=80', 'Natural hair treatment');

  -- Barber (Ifeanyi Eze)
  INSERT INTO public.worker_portfolios (worker_id, image_url, description) VALUES
    (w9, 'https://images.unsplash.com/photo-1599351431613-18ef1fdd27e1?auto=format&fit=crop&w=600&q=80', 'Skin fade haircut'),
    (w9, 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80', 'Low cut and beard trim'),
    (w9, 'https://images.unsplash.com/photo-1599351431613-18ef1fdd27e1?auto=format&fit=crop&w=600&q=80', 'Line-up and shape-up');

  -- House Cleaner (Amaka Uche)
  INSERT INTO public.worker_portfolios (worker_id, image_url, description) VALUES
    (w10, 'https://plus.unsplash.com/premium_photo-1667520405114-47d3677f966e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'Deep kitchen clean'),
    (w10, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80', 'Bathroom scrub and shine'),
    (w10, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80', 'Living room after clean');

  -- Laundry (Taiwo Olawale)
  INSERT INTO public.worker_portfolios (worker_id, image_url, description) VALUES
    (w11, 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=600&q=80', 'Freshly pressed clothes'),
    (w11, 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=600&q=80', 'Dry cleaning service'),
    (w11, 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80', 'Native wear handled with care');

  -- Phone & Computer Repair (Emeka Chukwu)
  INSERT INTO public.worker_portfolios (worker_id, image_url, description) VALUES
    (w12, 'https://images.unsplash.com/photo-1598327105854-c8674faddf79?auto=format&fit=crop&w=600&q=80', 'Phone screen replacement'),
    (w12, 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80', 'Laptop repair in progress'),
    (w12, 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=600&q=80', 'Charging port fix');

END;
$$;
