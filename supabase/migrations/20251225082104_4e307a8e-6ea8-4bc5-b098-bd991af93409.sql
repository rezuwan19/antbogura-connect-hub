-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create enum for request status
CREATE TYPE public.request_status AS ENUM ('pending', 'in_progress', 'complete', 'cancelled');

-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy for user_roles - only admins can view
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Connection Requests table
CREATE TABLE public.connection_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    district TEXT,
    upazila TEXT,
    address TEXT,
    package_name TEXT,
    message TEXT,
    status request_status NOT NULL DEFAULT 'pending',
    sms_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on connection_requests
ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;

-- Public can insert connection requests
CREATE POLICY "Anyone can submit connection request"
ON public.connection_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can view connection requests
CREATE POLICY "Admins can view connection requests"
ON public.connection_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update connection requests
CREATE POLICY "Admins can update connection requests"
ON public.connection_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Contact Messages table
CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    message TEXT NOT NULL,
    status request_status NOT NULL DEFAULT 'pending',
    sms_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on contact_messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Public can insert contact messages
CREATE POLICY "Anyone can submit contact message"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can view contact messages
CREATE POLICY "Admins can view contact messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update contact messages
CREATE POLICY "Admins can update contact messages"
ON public.contact_messages
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Problem Reports table
CREATE TABLE public.problem_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    customer_id TEXT,
    problem_type TEXT NOT NULL,
    description TEXT NOT NULL,
    status request_status NOT NULL DEFAULT 'pending',
    sms_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on problem_reports
ALTER TABLE public.problem_reports ENABLE ROW LEVEL SECURITY;

-- Public can insert problem reports
CREATE POLICY "Anyone can submit problem report"
ON public.problem_reports
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can view problem reports
CREATE POLICY "Admins can view problem reports"
ON public.problem_reports
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update problem reports
CREATE POLICY "Admins can update problem reports"
ON public.problem_reports
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_connection_requests_updated_at
    BEFORE UPDATE ON public.connection_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_problem_reports_updated_at
    BEFORE UPDATE ON public.problem_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();