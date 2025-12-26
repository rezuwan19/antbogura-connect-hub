-- The issue is that existing policies are RESTRICTIVE (not PERMISSIVE)
-- Let's drop all and recreate as PERMISSIVE policies

-- First, drop all existing SELECT and UPDATE policies for connection_requests
DROP POLICY IF EXISTS "Employees can view connection requests" ON public.connection_requests;
DROP POLICY IF EXISTS "Employees can update connection requests" ON public.connection_requests;

-- Create PERMISSIVE policies for connection_requests
CREATE POLICY "Employees can view connection requests" 
ON public.connection_requests 
FOR SELECT 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid())
);

CREATE POLICY "Employees can update connection requests" 
ON public.connection_requests 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid())
);

-- Drop and recreate for contact_messages
DROP POLICY IF EXISTS "Employees can view contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Employees can update contact messages" ON public.contact_messages;

CREATE POLICY "Employees can view contact messages" 
ON public.contact_messages 
FOR SELECT 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid())
);

CREATE POLICY "Employees can update contact messages" 
ON public.contact_messages 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid())
);

-- Drop and recreate for problem_reports
DROP POLICY IF EXISTS "Employees can view problem reports" ON public.problem_reports;
DROP POLICY IF EXISTS "Employees can update problem reports" ON public.problem_reports;

CREATE POLICY "Employees can view problem reports" 
ON public.problem_reports 
FOR SELECT 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid())
);

CREATE POLICY "Employees can update problem reports" 
ON public.problem_reports 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid())
);

-- Drop and recreate for activity_logs
DROP POLICY IF EXISTS "Employees can view all activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.activity_logs;

CREATE POLICY "Employees can view all activity logs" 
ON public.activity_logs 
FOR SELECT 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid())
);

-- Drop and recreate for profiles
DROP POLICY IF EXISTS "Employees can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Employees can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid())
);

-- Users should still be able to view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);