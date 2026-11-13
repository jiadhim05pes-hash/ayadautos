-- Restrict site configuration reads to super administrators.
DROP POLICY IF EXISTS "site_config public read" ON public.site_config;
REVOKE SELECT ON public.site_config FROM anon;
CREATE POLICY "Super admins read site config"
  ON public.site_config FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));

-- Public inquiry creation is handled through trusted server endpoints; remove direct table writes.
DROP POLICY IF EXISTS "Anyone can submit test drive" ON public.test_drive_requests;
REVOKE INSERT ON public.test_drive_requests FROM anon, authenticated;

DROP POLICY IF EXISTS "Anyone can submit trade-in" ON public.trade_in_requests;
REVOKE INSERT ON public.trade_in_requests FROM anon, authenticated;

DROP POLICY IF EXISTS "Anyone can submit finance" ON public.finance_requests;
REVOKE INSERT ON public.finance_requests FROM anon, authenticated;

DROP POLICY IF EXISTS "Anyone can create ai lead" ON public.ai_chat_leads;
REVOKE INSERT ON public.ai_chat_leads FROM anon, authenticated;

DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_messages;
REVOKE INSERT ON public.contact_messages FROM anon, authenticated;