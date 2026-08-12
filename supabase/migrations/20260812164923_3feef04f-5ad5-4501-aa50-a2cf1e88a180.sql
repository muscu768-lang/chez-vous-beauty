ALTER TABLE public.estheticians
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS lat double precision,
  ADD COLUMN IF NOT EXISTS lng double precision,
  ADD COLUMN IF NOT EXISTS google_place_url text,
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS estheticians_owner_id_key ON public.estheticians(owner_id) WHERE owner_id IS NOT NULL;

GRANT INSERT, UPDATE, DELETE ON public.estheticians TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.portfolio_items TO authenticated;
GRANT UPDATE, DELETE ON public.reviews TO authenticated;

DROP POLICY IF EXISTS "estheticians public read" ON public.estheticians;
CREATE POLICY "estheticians public read" ON public.estheticians
  FOR SELECT TO anon, authenticated USING (is_published OR owner_id = auth.uid());

CREATE POLICY "estheticians owner insert" ON public.estheticians
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "estheticians owner update" ON public.estheticians
  FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "estheticians owner delete" ON public.estheticians
  FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE OR REPLACE FUNCTION public.owns_esthetician(_esthetician_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.estheticians e
    WHERE e.id = _esthetician_id AND e.owner_id = auth.uid()
  )
$$;
REVOKE ALL ON FUNCTION public.owns_esthetician(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.owns_esthetician(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.owns_esthetician(uuid) TO authenticated;

CREATE POLICY "services owner manage" ON public.services
  FOR ALL TO authenticated
  USING (public.owns_esthetician(esthetician_id))
  WITH CHECK (public.owns_esthetician(esthetician_id));

CREATE POLICY "portfolio owner manage" ON public.portfolio_items
  FOR ALL TO authenticated
  USING (public.owns_esthetician(esthetician_id))
  WITH CHECK (public.owns_esthetician(esthetician_id));

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'edito',
  ADD COLUMN IF NOT EXISTS source_url text;

CREATE POLICY "reviews owner import" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (source = 'google' AND user_id IS NULL AND public.owns_esthetician(esthetician_id));

CREATE POLICY "reviews owner delete imported" ON public.reviews
  FOR DELETE TO authenticated
  USING (source = 'google' AND public.owns_esthetician(esthetician_id));

CREATE OR REPLACE FUNCTION public.refresh_esthetician_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id uuid := COALESCE(NEW.esthetician_id, OLD.esthetician_id);
BEGIN
  UPDATE public.estheticians e
  SET rating = COALESCE((SELECT ROUND(AVG(r.rating)::numeric, 1) FROM public.reviews r WHERE r.esthetician_id = _id), 5.0),
      reviews_count = (SELECT COUNT(*) FROM public.reviews r WHERE r.esthetician_id = _id)
  WHERE e.id = _id;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS reviews_refresh_rating ON public.reviews;
CREATE TRIGGER reviews_refresh_rating
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.refresh_esthetician_rating();

CREATE POLICY "pro media public read" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'pro-media');
CREATE POLICY "pro media owner insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'pro-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "pro media owner update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'pro-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "pro media owner delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'pro-media' AND (storage.foldername(name))[1] = auth.uid()::text);