-- Migration 00006: Add increment_recommended_by RPC

CREATE OR REPLACE FUNCTION increment_recommended_by(worker_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.workers
  SET recommended_by = COALESCE(recommended_by, 0) + 1
  WHERE id = worker_id;
$$;
