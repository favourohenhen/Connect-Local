-- Migration 00008: Enforce unique reviews per user and worker.
--
-- A user should be able to recommend MULTIPLE workers, but only ONCE per worker.
-- This ensures that a single user cannot leave multiple reviews for the same worker.

ALTER TABLE public.reviews
ADD CONSTRAINT unique_user_worker_review UNIQUE (user_id, worker_id);
