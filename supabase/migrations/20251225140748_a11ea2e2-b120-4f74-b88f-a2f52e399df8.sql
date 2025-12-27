-- Drop restrictive insert policies and recreate as permissive
DROP POLICY IF EXISTS "Anyone can submit connection request" ON public.connection_requests;
DROP POLICY IF EXISTS "Anyone can submit contact message" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone can submit problem report" ON public.problem_reports;

-- Recreate insert policies as PERMISSIVE (default) for public form submissions
CREATE POLICY "Anyone can submit connection request" 
ON public.connection_requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can submit contact message" 
ON public.contact_messages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can submit problem report" 
ON public.problem_reports 
FOR INSERT 
WITH CHECK (true);