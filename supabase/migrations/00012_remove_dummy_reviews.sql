-- Migration 00012: Clean up the anonymous dummy reviews 
-- created by the previous (now reverted) migration.

DELETE FROM public.reviews WHERE user_id IS NULL AND comment = 'Excellent service. Highly recommended.';
