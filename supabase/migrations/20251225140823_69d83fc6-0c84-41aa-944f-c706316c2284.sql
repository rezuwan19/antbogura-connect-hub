-- Drop all existing policies and recreate properly
-- Connection requests
DROP POLICY IF EXISTS "Anyone can submit connection request" ON public.connection_requests;
DROP POLICY IF EXISTS "Admins can view connection requests" ON public.connection_requests;
DROP POLICY IF EXISTS "Admins can update connection requests" ON public.connection_requests;

-- Contact messages  
DROP POLICY IF EXISTS "Anyone can submit contact message" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;

-- Problem reports
DROP POLICY IF EXISTS "Anyone can submit problem report" ON public.problem_reports;
DROP POLICY IF EXISTS "Admins can view problem reports" ON public.problem_reports;
DROP POLICY IF EXISTS "Admins can update problem reports" ON public.problem_reports;

-- User roles
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- Recreate all policies as PERMISSIVE (default type)

-- Connection requests policies
CREATE POLICY "Anyone can submit connection request" 
ON public.connection_requests 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view connection requests" 
ON public.connection_requests 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update connection requests" 
ON public.connection_requests 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Contact messages policies
CREATE POLICY "Anyone can submit contact message" 
ON public.contact_messages 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view contact messages" 
ON public.contact_messages 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update contact messages" 
ON public.contact_messages 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Problem reports policies
CREATE POLICY "Anyone can submit problem report" 
ON public.problem_reports 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view problem reports" 
ON public.problem_reports 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update problem reports" 
ON public.problem_reports 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- User roles policies
CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert roles" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can manage roles" 
ON public.user_roles 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);