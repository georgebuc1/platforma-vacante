/*
# Extend offers table with full schema + RLS

## Summary
Adds all missing columns that the "Vacanța Mea" application uses beyond the
existing basic columns, enables Row Level Security, and creates anon+authenticated
CRUD policies so the frontend (using the anon key, no sign-in) can read and write.

## Changes to existing table: public.offers

### New columns added (all nullable with sensible defaults):
- `slug` (text, unique) – URL-friendly identifier generated from title
- `short_description` (text) – brief summary shown on cards
- `full_description` (text) – detailed offer description
- `region` (text) – geographic region / sub-destination
- `trip_types` (text[]) – array of trip type tags: beach, city_break, mountain, etc.
- `transport_type` (text) – avion / autocar / masina / tren / avion_transfer
- `departure_airport` (text) – IATA code + name of departure airport
- `airline` (text) – airline name
- `stops` (text) – direct / o_escala / mai_multe_escale
- `duration_days` (integer) – total trip length in days
- `duration_nights` (integer) – total nights
- `accommodation_included` (boolean, default true) – whether hotel is in package
- `number_of_nights` (integer) – explicit hotel nights (may differ from duration)
- `meal_type` (text) – fara_masa / mic_dejun / demipensiune / pensiune_completa / all_inclusive
- `currency` (text, default 'RON') – price currency
- `price_type` (text, default 'per_person') – per_person or total
- `number_of_people` (integer, default 1)
- `provider_name` (text) – name of travel agency / provider
- `is_affiliate_link` (boolean, default false)
- `gallery_images` (text[]) – additional image URLs
- `offer_score` (numeric) – score 1-10 (already exists as offer_score but kept)
- `score_reason` (text) – explanation of the score
- `status` (text, default 'active') – draft / active / expired / archived
- `last_checked_at` (date) – when price was last verified
- `click_count` (integer, default 0) – total click count (mirrors existing `clicks`)

### Existing column notes:
- `active` (boolean) kept for backward compat; `status` is the canonical field
- `clicks` kept for backward compat; `click_count` is the canonical field
- `supplier` kept; `provider_name` is the canonical field
- `vacation_type` kept; `trip_types` is the canonical array field
- `image_url` kept; used as main_image_url fallback

## Security
- Enable RLS on offers table.
- Grant full CRUD to both anon and authenticated roles (no-auth admin app).
*/

-- Add missing columns (all idempotent via DO blocks)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='slug') THEN
    ALTER TABLE offers ADD COLUMN slug text UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='short_description') THEN
    ALTER TABLE offers ADD COLUMN short_description text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='full_description') THEN
    ALTER TABLE offers ADD COLUMN full_description text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='region') THEN
    ALTER TABLE offers ADD COLUMN region text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='trip_types') THEN
    ALTER TABLE offers ADD COLUMN trip_types text[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='transport_type') THEN
    ALTER TABLE offers ADD COLUMN transport_type text DEFAULT 'avion';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='departure_airport') THEN
    ALTER TABLE offers ADD COLUMN departure_airport text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='airline') THEN
    ALTER TABLE offers ADD COLUMN airline text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='stops') THEN
    ALTER TABLE offers ADD COLUMN stops text DEFAULT 'direct';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='duration_days') THEN
    ALTER TABLE offers ADD COLUMN duration_days integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='duration_nights') THEN
    ALTER TABLE offers ADD COLUMN duration_nights integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='accommodation_included') THEN
    ALTER TABLE offers ADD COLUMN accommodation_included boolean DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='number_of_nights') THEN
    ALTER TABLE offers ADD COLUMN number_of_nights integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='meal_type') THEN
    ALTER TABLE offers ADD COLUMN meal_type text DEFAULT 'fara_masa';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='currency') THEN
    ALTER TABLE offers ADD COLUMN currency text DEFAULT 'RON';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='price_type') THEN
    ALTER TABLE offers ADD COLUMN price_type text DEFAULT 'per_person';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='number_of_people') THEN
    ALTER TABLE offers ADD COLUMN number_of_people integer DEFAULT 1;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='provider_name') THEN
    ALTER TABLE offers ADD COLUMN provider_name text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='is_affiliate_link') THEN
    ALTER TABLE offers ADD COLUMN is_affiliate_link boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='gallery_images') THEN
    ALTER TABLE offers ADD COLUMN gallery_images text[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='score_reason') THEN
    ALTER TABLE offers ADD COLUMN score_reason text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='status') THEN
    ALTER TABLE offers ADD COLUMN status text DEFAULT 'active';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='last_checked_at') THEN
    ALTER TABLE offers ADD COLUMN last_checked_at date DEFAULT CURRENT_DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='click_count') THEN
    ALTER TABLE offers ADD COLUMN click_count integer DEFAULT 0;
  END IF;
END $$;

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS offers_slug_idx ON offers (slug);
CREATE INDEX IF NOT EXISTS offers_status_idx ON offers (status);
CREATE INDEX IF NOT EXISTS offers_departure_date_idx ON offers (departure_date);

-- Enable RLS
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- CRUD policies for anon + authenticated (no-auth admin app)
DROP POLICY IF EXISTS "anon_select_offers" ON offers;
CREATE POLICY "anon_select_offers" ON offers FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_offers" ON offers;
CREATE POLICY "anon_insert_offers" ON offers FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_offers" ON offers;
CREATE POLICY "anon_update_offers" ON offers FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_offers" ON offers;
CREATE POLICY "anon_delete_offers" ON offers FOR DELETE
TO anon, authenticated USING (true);
