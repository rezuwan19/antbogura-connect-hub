-- Create table to track user device sessions
CREATE TABLE public.device_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_name text NOT NULL,
  device_type text NOT NULL DEFAULT 'unknown',
  browser text,
  os text,
  ip_address text,
  last_active timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_current boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;

-- Admins can view all device sessions
CREATE POLICY "Admins can view all device sessions"
ON public.device_sessions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
ON public.device_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own sessions (logout from device)
CREATE POLICY "Users can delete own sessions"
ON public.device_sessions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Service role can manage all sessions
CREATE POLICY "Service role can manage sessions"
ON public.device_sessions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to insert their own sessions
CREATE POLICY "Users can insert own sessions"
ON public.device_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own sessions
CREATE POLICY "Users can update own sessions"
ON public.device_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);