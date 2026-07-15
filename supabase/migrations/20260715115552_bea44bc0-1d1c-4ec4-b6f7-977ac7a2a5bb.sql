
CREATE POLICY "Public read vehicle-images" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'vehicle-images');
CREATE POLICY "Staff upload vehicle-images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vehicle-images' AND public.is_staff_or_admin(auth.uid()));
CREATE POLICY "Staff update vehicle-images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'vehicle-images' AND public.is_staff_or_admin(auth.uid()));
CREATE POLICY "Staff delete vehicle-images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'vehicle-images' AND public.is_staff_or_admin(auth.uid()));
