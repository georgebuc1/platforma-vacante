-- Public images remain readable, but only the designated admin may mutate the offers bucket.
DROP POLICY IF EXISTS "auth_insert_offers_bucket" ON storage.objects;
DROP POLICY IF EXISTS "auth_update_offers_bucket" ON storage.objects;
DROP POLICY IF EXISTS "auth_delete_offers_bucket" ON storage.objects;
DROP POLICY IF EXISTS "admin_insert_offers_bucket" ON storage.objects;
DROP POLICY IF EXISTS "admin_update_offers_bucket" ON storage.objects;
DROP POLICY IF EXISTS "admin_delete_offers_bucket" ON storage.objects;

CREATE POLICY "admin_insert_offers_bucket" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'offers' AND (auth.jwt() ->> 'email') = 'georgebuc1@gmail.com');
CREATE POLICY "admin_update_offers_bucket" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'offers' AND (auth.jwt() ->> 'email') = 'georgebuc1@gmail.com')
WITH CHECK (bucket_id = 'offers' AND (auth.jwt() ->> 'email') = 'georgebuc1@gmail.com');
CREATE POLICY "admin_delete_offers_bucket" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'offers' AND (auth.jwt() ->> 'email') = 'georgebuc1@gmail.com');

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  consent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON public.contact_messages (created_at DESC);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_insert_contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "admin_select_contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "admin_delete_contact_messages" ON public.contact_messages;
CREATE POLICY "public_insert_contact_messages" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (consent = true);
CREATE POLICY "admin_select_contact_messages" ON public.contact_messages FOR SELECT TO authenticated USING ((auth.jwt() ->> 'email') = 'georgebuc1@gmail.com');
CREATE POLICY "admin_delete_contact_messages" ON public.contact_messages FOR DELETE TO authenticated USING ((auth.jwt() ->> 'email') = 'georgebuc1@gmail.com');
