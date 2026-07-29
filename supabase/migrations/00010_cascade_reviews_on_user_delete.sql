-- Drop existing foreign key constraint if it exists (it might be named reviews_customer_id_fkey or reviews_user_id_fkey depending on the prior migrations)
ALTER TABLE public.reviews
DROP CONSTRAINT IF EXISTS reviews_customer_id_fkey,
DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

-- Re-add the foreign key constraint with ON DELETE CASCADE
ALTER TABLE public.reviews
ADD CONSTRAINT reviews_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;
