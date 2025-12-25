-- Create activity_logs table for tracking security events
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trusted_devices table for 2FA skip
CREATE TABLE public.trusted_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_token TEXT NOT NULL UNIQUE,
  device_name TEXT NOT NULL,
  browser TEXT,
  os TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recovery_codes table for 2FA backup
CREATE TABLE public.recovery_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code_hash TEXT NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_codes ENABLE ROW LEVEL SECURITY;

-- Activity logs policies (users can only view their own logs)
CREATE POLICY "Users can view their own activity logs" 
ON public.activity_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert activity logs" 
ON public.activity_logs 
FOR INSERT 
WITH CHECK (true);

-- Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs" 
ON public.activity_logs 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trusted devices policies
CREATE POLICY "Users can view their own trusted devices" 
ON public.trusted_devices 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trusted devices" 
ON public.trusted_devices 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trusted devices" 
ON public.trusted_devices 
FOR DELETE 
USING (auth.uid() = user_id);

-- Recovery codes policies
CREATE POLICY "Users can view their own recovery codes" 
ON public.recovery_codes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recovery codes" 
ON public.recovery_codes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recovery codes" 
ON public.recovery_codes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recovery codes" 
ON public.recovery_codes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_trusted_devices_user_id ON public.trusted_devices(user_id);
CREATE INDEX idx_trusted_devices_token ON public.trusted_devices(device_token);
CREATE INDEX idx_recovery_codes_user_id ON public.recovery_codes(user_id);