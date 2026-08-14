/*
# Create admin_access_log table

## Summary
The frontend already contains a fully-wired "admin access log" feature
(LoginPage logs failed logins, ProtectedRoute logs unauthenticated hits on
/admin routes, AdminDashboard displays the recent entries) but the
underlying table was never created — this migration adds it.

## New table: public.admin_access_log
- `id` (uuid, primary key)
- `event_type` (text) – 'failed_login' | 'unauthorized_access'
- `email_attempted` (text, nullable) – email typed on a failed login attempt
- `path` (text, nullable) – route someone tried to reach without a session
- `user_agent` (text, nullable) – browser user agent string
- `created_at` (timestamptz, default now())

## Security
- RLS enabled.
- Anyone (anon + authenticated) can INSERT — this is what lets the log
  capture attempts from people who are NOT logged in, which is the whole
  point of the feature.
- Only the admin account can SELECT (read the log) or DELETE (clear it).
  No one — including anon — can UPDATE entries, since log rows should be
  immutable once written.
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

-- Anyone (including logged-out visitors) can write a log entry
DROP POLICY IF EXISTS "public_insert_admin_access_log" ON admin_access_log;
CREATE POLICY "public_insert_admin_access_log" ON admin_access_log FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- Only the admin account can read the log
DROP POLICY IF EXISTS "admin_select_admin_access_log" ON admin_access_log;
CREATE POLICY "admin_select_admin_access_log" ON admin_access_log FOR SELECT
TO authenticated
USING ((auth.jwt() ->> 'email') = 'georgebuc1@gmail.com');

-- Only the admin account can clear old entries
DROP POLICY IF EXISTS "admin_delete_admin_access_log" ON admin_access_log;
CREATE POLICY "admin_delete_admin_access_log" ON admin_access_log FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'email') = 'georgebuc1@gmail.com');
