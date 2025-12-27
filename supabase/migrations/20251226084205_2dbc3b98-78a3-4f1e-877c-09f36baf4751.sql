-- Drop existing restrictive policies for connection_requests
DROP POLICY IF EXISTS "Admins can view connection requests" ON public.connection_requests;
DROP POLICY IF EXISTS "Admins can update connection requests" ON public.connection_requests;

-- Create new policies that allow all employees (admin, manager, user) to view and update
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

-- Drop existing restrictive policies for contact_messages
DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;

-- Create new policies for contact_messages
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

-- Drop existing restrictive policies for problem_reports
DROP POLICY IF EXISTS "Admins can view problem reports" ON public.problem_reports;
DROP POLICY IF EXISTS "Admins can update problem reports" ON public.problem_reports;

-- Create new policies for problem_reports
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

-- Update activity_logs policy to allow all employees to view
DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.activity_logs;

CREATE POLICY "Employees can view all activity logs" 
ON public.activity_logs 
FOR SELECT 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid())
);

-- Update profiles policies to allow managers and employees to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Employees can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid())
);