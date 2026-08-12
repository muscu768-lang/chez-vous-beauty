REVOKE ALL ON FUNCTION public.refresh_esthetician_rating() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.refresh_esthetician_rating() FROM anon;
REVOKE ALL ON FUNCTION public.refresh_esthetician_rating() FROM authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM anon;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM authenticated;