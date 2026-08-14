/*
# Admin access log

## Summary
Tracks two kinds of security-relevant events so the admin can see them
directly inside the Admin Dashboard, without digging through Supabase's
own Auth Logs:

  1. `failed_login`   – someone submitted the login form with wrong
                         credentials (email attempted is recorded).
  2. `unauthorized_access` – someone loaded a /admin/* route without a
                         valid session and got redirected to /login.

## New table: public.admin_access_log
- `id` (uuid, primary key)
- `event_type` (text) – 'failed_login' | 'unauthorized_access'
- `email_attempted` (text, nullable) – only set for failed_login events
- `path` (text, nullable) – route that was hit for unauthorized_access
- `user_agent` (text, nullable) – browser info, for extra context
- `created_at` (timestamptz, default now())

## Security
- Enable RLS.
- Anyone (including anonymous visitors — this is the whole point, we're
  logging attempts from people who are NOT logged in) can INSERT an event.
- Only the admin account can SELECT (read) the log — it may reveal
  attempted email addresses and IP-adjacent info via user agent, so it
  must not be publicly readable.
- No UPDATE policy — log entries are immutable by design.
- DELETE is admin-only, for periodic cleanup.
*/

CREATE TABLE IF NOT EXISTS admin_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('failed_login', 'unauthorized_access')),
  email_attempted text,
  path text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_access_log_created_at_idx ON admin_access_log (created_at DESC);

ALTER TABLE admin_access_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_admin_access_log" ON admin_access_log;
CREATE POLICY "public_insert_admin_access_log" ON admin_access_log FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_select_admin_access_log" ON admin_access_log;
CREATE POLICY "admin_select_admin_access_log" ON admin_access_log FOR SELECT
TO authenticated
USING ((auth.jwt() ->> 'email') = 'georgebuc1@gmail.com');

DROP POLICY IF EXISTS "admin_delete_admin_access_log" ON admin_access_log;
CREATE POLICY "admin_delete_admin_access_log" ON admin_access_log FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'email') = 'georgebuc1@gmail.com');
