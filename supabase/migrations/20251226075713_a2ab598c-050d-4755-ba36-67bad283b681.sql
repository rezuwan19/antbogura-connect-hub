-- Create a function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Create a function to check if user can manage another user based on roles
CREATE OR REPLACE FUNCTION public.can_manage_user(_manager_id uuid, _target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- Admin can manage anyone
    (SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _manager_id AND role = 'admin'))
    OR
    -- Manager can manage only users (not admins or other managers)
    (
      (SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _manager_id AND role = 'manager'))
      AND
      (SELECT NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _target_user_id AND role IN ('admin', 'manager')))
    )
$$;