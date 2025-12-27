-- The issue is that user_roles table RLS doesn't allow users to check their own role
-- We need to add a policy that allows users to see if they exist in user_roles

-- First, let's check and add policy for users to see their own role entry
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;

CREATE POLICY "Users can view own role" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);