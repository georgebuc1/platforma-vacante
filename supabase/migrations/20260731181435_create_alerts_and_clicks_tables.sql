/*
# Create alerts and clicks tables

## Summary
Creates two new tables to replace localStorage for alerts and click tracking.

## New Tables

### public.alerts
Stores price alerts created by visitors on the /alerte page.
- `id` (uuid, primary key)
- `email` (text, not null)
- `departure_city` (text, not null)
- `max_budget` (integer, not null)
- `country` (text, nullable)
- `trip_type` (text, nullable)
- `month` (text, nullable)
- `duration` (text, nullable)
- `frequency` (text, not null) – immediate / daily / weekly
- `consent` (boolean, not null)
- `status` (text, default 'active') – active / inactive
- `created_at` (timestamptz, default now())

### public.clicks
Tracks user interactions with offers (view, check_offer).
- `id` (uuid, primary key)
- `offer_id` (bigint, FK → offers.id, nullable – stays if offer deleted)
- `offer_slug` (text, not null) – denormalized for resilience
- `action` (text, not null) – view / check_offer
- `timestamp` (timestamptz, default now())

## Security
- Enable RLS on both tables.
- anon + authenticated: full CRUD (no-auth app).
*/

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  departure_city text NOT NULL,
  max_budget integer NOT NULL,
  country text,
  trip_type text,
  month text,
  duration text,
  frequency text NOT NULL DEFAULT 'immediate',
  consent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_alerts" ON alerts;
CREATE POLICY "anon_select_alerts" ON alerts FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_alerts" ON alerts;
CREATE POLICY "anon_insert_alerts" ON alerts FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_alerts" ON alerts;
CREATE POLICY "anon_update_alerts" ON alerts FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_alerts" ON alerts;
CREATE POLICY "anon_delete_alerts" ON alerts FOR DELETE
TO anon, authenticated USING (true);

-- Clicks table
CREATE TABLE IF NOT EXISTS clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id bigint REFERENCES offers(id) ON DELETE SET NULL,
  offer_slug text NOT NULL,
  action text NOT NULL DEFAULT 'view',
  timestamp timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS clicks_offer_id_idx ON clicks (offer_id);
CREATE INDEX IF NOT EXISTS clicks_timestamp_idx ON clicks (timestamp DESC);

ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_clicks" ON clicks;
CREATE POLICY "anon_select_clicks" ON clicks FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_clicks" ON clicks;
CREATE POLICY "anon_insert_clicks" ON clicks FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_clicks" ON clicks;
CREATE POLICY "anon_update_clicks" ON clicks FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_clicks" ON clicks;
CREATE POLICY "anon_delete_clicks" ON clicks FOR DELETE
TO anon, authenticated USING (true);
