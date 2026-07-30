-- Migration 00014: Add call outcome tracking to jobs table

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS picked_up BOOLEAN DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS job_completed BOOLEAN DEFAULT NULL;
