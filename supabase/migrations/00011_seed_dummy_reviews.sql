-- Migration 00011: Migrate static recommended_by counts to actual review rows
-- Since the frontend now dynamically derives recommendations from the reviews table,
-- we need to convert the initial dummy static counts into actual review rows 
-- to preserve the demo data appearance.

DO $$ 
DECLARE
  rec RECORD;
  i INT;
BEGIN
  -- Loop over all workers that currently have a static recommended_by count
  FOR rec IN SELECT id, recommended_by FROM public.workers WHERE recommended_by > 0 LOOP
    
    -- Insert that exact number of positive reviews
    FOR i IN 1..rec.recommended_by LOOP
      INSERT INTO public.reviews (worker_id, user_id, rating, would_rehire, comment, tags)
      VALUES (
        rec.id, 
        NULL, -- NULL user_id allows bypassing the unique_user_worker_review constraint
        5, 
        true, 
        'Excellent service. Highly recommended.', 
        ARRAY['Professional', 'Punctual']
      );
    END LOOP;
    
  END LOOP;
END $$;
