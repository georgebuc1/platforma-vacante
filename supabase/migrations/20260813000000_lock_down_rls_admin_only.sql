/*
# Lock down Row Level Security — admin-only writes, protect PII

## Problem being fixed
The initial migrations granted full CRUD (SELECT/INSERT/UPDATE/DELETE) to the
`anon` role with `USING (true)` / `WITH CHECK (true)` on `offers`, `alerts`,
and `clicks`. This means ANY visitor — without logging in — could call the
Supabase REST API directly (using the public anon key, which is always
visible in browser JS) and:
  - create, edit or delete offers, bypassing the /admin login entirely
  - read every email address stored in `alerts` (personal data)
  - tamper with click-tracking data

The `/admin` login screen in the frontend was never actually enforced by the
database, so it provided no real protection.

## Fix
- `offers`: public can still SELECT (needed for the storefront), but
  INSERT / UPDATE / DELETE now require an authenticated session belonging
  to the admin email.
- `alerts`: public can still INSERT (visitors submit the alert form without
  an account), but SELECT / UPDATE / DELETE are now admin-only — no one else
  can read the list of emails.
- `clicks`: public can still INSERT (anonymous click tracking), but
  SELECT / UPDATE / DELETE are now admin-only.

NOTE: the admin email below must match ADMIN_EMAIL in
src/components/admin/ProtectedRoute.tsx. If you ever change the admin
account, update it in both places.
*/

-- =========================================================
-- OFFERS
-- =========================================================

DROP POLICY IF EXISTS "anon_select_offers" ON offers;
DROP POLICY IF EXISTS "anon_insert_offers" ON offers;
DROP POLICY IF EXISTS "anon_update_offers" ON offers;
DROP POLICY IF EXISTS "anon_delete_offers" ON offers;

-- Anyone can browse offers (this is a public storefront)
CREATE POLICY "public_select_offers" ON offers FOR SELECT
TO anon, authenticated USING (true);

-- Only the admin account can create offers
CREATE POLICY "admin_insert_offers" ON offers FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'email') = 'georgebuc1@gmail.com');

-- Only the admin account can edit offers
CREATE POLICY "admin_update_offers" ON offers FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'email') = 'georgebuc1@gmail.com')
WITH CHECK ((auth.jwt() ->> 'email') = 'georgebuc1@gmail.com');

-- Only the admin account can delete offers
CREATE POLICY "admin_delete_offers" ON offers FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'email') = 'georgebuc1@gmail.com');


-- =========================================================
-- SAFE CLICK-COUNTER FUNCTION
-- =========================================================
-- Anonymous visitors need to increment an offer's click counter when they
-- view it or click through to the provider. Rather than granting anon a
-- blanket UPDATE on `offers` (which would reopen the security hole), this
-- narrow SECURITY DEFINER function does exactly one safe thing: bump the
-- two click counters for a single row. It cannot be used to change price,
-- title, or any other field.

CREATE OR REPLACE FUNCTION increment_offer_clicks(offer_id_input bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE offers
  SET click_count = COALESCE(click_count, 0) + 1,
      clicks = COALESCE(clicks, 0) + 1
  WHERE id = offer_id_input;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_offer_clicks(bigint) TO anon, authenticated;


-- =========================================================
-- ALERTS  (contains visitor email addresses — PII)
-- =========================================================

DROP POLICY IF EXISTS "anon_select_alerts" ON alerts;
DROP POLICY IF EXISTS "anon_insert_alerts" ON alerts;
DROP POLICY IF EXISTS "anon_update_alerts" ON alerts;
DROP POLICY IF EXISTS "anon_delete_alerts" ON alerts;

-- Visitors can submit the alert form without an account
CREATE POLICY "public_insert_alerts" ON alerts FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- Only the admin can read the list of alerts/emails
CREATE POLICY "admin_select_alerts" ON alerts FOR SELECT
TO authenticated
USING ((auth.jwt() ->> 'email') = 'georgebuc1@gmail.com');

-- Only the admin can update alert status
CREATE POLICY "admin_update_alerts" ON alerts FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'email') = 'georgebuc1@gmail.com')
WITH CHECK ((auth.jwt() ->> 'email') = 'georgebuc1@gmail.com');

-- Only the admin can delete alerts
CREATE POLICY "admin_delete_alerts" ON alerts FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'email') = 'georgebuc1@gmail.com');


-- =========================================================
-- CLICKS  (analytics data)
-- =========================================================

DROP POLICY IF EXISTS "anon_select_clicks" ON clicks;
DROP POLICY IF EXISTS "anon_insert_clicks" ON clicks;
DROP POLICY IF EXISTS "anon_update_clicks" ON clicks;
DROP POLICY IF EXISTS "anon_delete_clicks" ON clicks;

-- Anonymous click tracking must keep working without login
CREATE POLICY "public_insert_clicks" ON clicks FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- Only the admin can view analytics
CREATE POLICY "admin_select_clicks" ON clicks FOR SELECT
TO authenticated
USING ((auth.jwt() ->> 'email') = 'georgebuc1@gmail.com');

-- Only the admin can delete old click data
CREATE POLICY "admin_delete_clicks" ON clicks FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'email') = 'georgebuc1@gmail.com');
