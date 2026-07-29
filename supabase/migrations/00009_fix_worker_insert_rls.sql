-- Drop any existing restrictive insert policies that might be failing during signup
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Workers can insert their own worker profile" ON public.workers;

-- Create broad insert policies for authenticated users
CREATE POLICY "Allow insert for authenticated users on profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow insert for authenticated users on workers"
ON public.workers
FOR INSERT
TO authenticated
WITH CHECK (true);
