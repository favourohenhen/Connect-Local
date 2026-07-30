-- Migration 00013: Add admin RPCs to bypass RLS for approval/rejection

-- Approve worker
CREATE OR REPLACE FUNCTION approve_worker(worker_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.workers SET status = 'verified' WHERE id = worker_id;
END;
$$;

-- Reject (delete) worker
CREATE OR REPLACE FUNCTION reject_worker(worker_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First delete the worker profile
  DELETE FROM public.workers WHERE id = worker_id;
  -- Then delete the user profile so they can sign up again
  DELETE FROM public.profiles WHERE id = worker_id;
END;
$$;
