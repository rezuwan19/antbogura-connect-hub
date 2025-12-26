-- Create a function to sync profile role with user_roles
CREATE OR REPLACE FUNCTION public.sync_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the profile role to match the user_roles role
  UPDATE public.profiles
  SET role = NEW.role::text
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to sync on INSERT
CREATE TRIGGER sync_profile_role_on_insert
  AFTER INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_role();

-- Create trigger to sync on UPDATE
CREATE TRIGGER sync_profile_role_on_update
  AFTER UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_role();

-- Sync existing data: update profiles to match user_roles
UPDATE public.profiles p
SET role = ur.role::text
FROM public.user_roles ur
WHERE p.user_id = ur.user_id
AND (p.role IS DISTINCT FROM ur.role::text);