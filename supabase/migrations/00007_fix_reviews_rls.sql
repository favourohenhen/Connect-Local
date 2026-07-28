-- Migration 00007: Fix broken RLS INSERT policy on reviews table.
--
-- Root cause: Migration 00001 created the INSERT policy referencing `customer_id`.
-- Migration 00002 renamed that column to `user_id`, but the policy was never updated.
-- The old policy expression `auth.uid() = customer_id` now references a non-existent
-- column, causing all authenticated review inserts to be rejected silently.

DROP POLICY IF EXISTS "Customers can insert reviews" ON public.reviews;

CREATE POLICY "Customers can insert reviews"
  ON public.reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
