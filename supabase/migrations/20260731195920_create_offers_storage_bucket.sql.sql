/*
# Create public "offers" storage bucket

1. Storage
- Create a public bucket named "offers" for uploading offer images.
- Public bucket: anyone can read images without auth.
2. Policies
- Allow anyone (anon, authenticated) to READ files from the bucket (public images).
- Allow authenticated users to INSERT (upload) files.
- Allow authenticated users to UPDATE files.
- Allow authenticated users to DELETE files.
3. Notes
- The bucket is public so visitors can see offer images without logging in.
- Only authenticated users (the admin) can upload, replace, or delete images.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('offers', 'offers', true)
ON CONFLICT (id) DO NOTHING;

-- SELECT: public read
DROP POLICY IF EXISTS "public_read_offers_bucket" ON storage.objects;
CREATE POLICY "public_read_offers_bucket"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'offers');

-- INSERT: authenticated only
DROP POLICY IF EXISTS "auth_insert_offers_bucket" ON storage.objects;
CREATE POLICY "auth_insert_offers_bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'offers');

-- UPDATE: authenticated only
DROP POLICY IF EXISTS "auth_update_offers_bucket" ON storage.objects;
CREATE POLICY "auth_update_offers_bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'offers')
WITH CHECK (bucket_id = 'offers');

-- DELETE: authenticated only
DROP POLICY IF EXISTS "auth_delete_offers_bucket" ON storage.objects;
CREATE POLICY "auth_delete_offers_bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'offers');
